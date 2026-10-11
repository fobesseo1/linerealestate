// Run once for the explicitly approved move of existing public data. Idempotent checkpoints.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import {emptyContent} from '../lib/content/types.ts';
import {mapAddress} from '../lib/maps/address.mjs';
import {webpPhotoBuffer} from '../lib/content/photo-node.mjs';
process.loadEnvFile('.env.local');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
const check=r=>{if(r.error)throw Error(r.error.message);return r.data;};
await mkdir('.tmp/content/migration',{recursive:true});
const works=JSON.parse(await readFile('lib/real-cases.json','utf8'));
const maps=JSON.parse(await readFile('lib/maps/public-config.json','utf8'));
let aliases={};try{aliases=JSON.parse(await readFile('lib/content/legacy-work-routes.json','utf8'));}catch{}
const backup=check(await db.from('lineestate_drafts').select('*'));
await writeFile('.tmp/content/migration/drafts-before.json',JSON.stringify(backup,null,2));
for(const w of works){
 let draft=aliases[w.id]?check(await db.from('lineestate_drafts').select('*').eq('number',aliases[w.id]).single()):null;
 if(!draft){
  const area=parseFloat(w.area.replace(/[^0-9.]/g,''));
  const money=s=>s.includes('억')?({pyeonbaek:12000,comma:10000,clinic:15000}[w.id]||0):parseFloat(s.replace(/[^0-9.]/g,''));
  const content={...emptyContent(),kind:'work',title:w.name,industry:w.category,address:w.address,showMap:true,area:(area*3.3058).toFixed(2),deposit:String(money(w.deposit)),rent:String(money(w.rent)),vat:'별도',floor:w.id==='salon'?'6':w.id==='comma'?'지하 1':w.id==='clinic'?'5':'2',building:w.id==='salon'?'비전빌딩 602호':'',description:[w.title.replace(/<br\s*\/?>/g,' '),w.summary,w.scope||'',`거래 당시 전용면적: ${w.area}`,`이 사례에서 보실 수 있는 중개 방식: ${w.lesson}`,`함께 확인할 사항:\n${w.checks.join('\n')}`,`상담 시 정리할 자료: ${w.deliverable}`,'중개 완료 사례이며 현재 모집 중인 매물이 아닙니다.'].filter(Boolean).join('\n\n'),initial:w.initial,issue:w.issue,actions:w.actions.join('\n'),outcome:w.outcome};
  const position=maps.positions[mapAddress(w.address)];if(position){content.latitude=position.latitude;content.longitude=position.longitude;}
  draft=check(await db.from('lineestate_drafts').insert({content,private_notes:`기존 공개 사례 이전: ${w.id}`}).select().single());
  aliases[w.id]=draft.number;await writeFile('lib/content/legacy-work-routes.json',JSON.stringify(aliases,null,2)+'\n');
 }
 const existing=check(await db.from('lineestate_published').select('id').eq('id',draft.id).maybeSingle());
 if(existing){console.log(`Already migrated: ${w.id} ${draft.number}`);continue;}
 const candidate={...draft.content,photos:[]};
 for(const p of w.photos||[]){const raw=await readFile(`public${p.src}`),originalPath=`${draft.id}/migration/original-${p.src.split('/').pop()}`;

  const path=`${draft.id}/migration/${candidate.photos.length}.webp`;check(await db.storage.from('lineestate-originals').upload(path,await webpPhotoBuffer(raw),{contentType:'image/webp',upsert:true}));candidate.photos.push({path,label:p.label});}
 const rev=check(await db.from('lineestate_revisions').insert({draft_id:draft.id,base_version:draft.version,original:draft.content,candidate,summary:'기존 공개 중개 사례의 관리자 데이터 이전. 내용 유지, 사진 WebP 1200px 규격 적용.'}).select().single());
 const photos=[];for(const [i,p]of candidate.photos.entries()){const blob=check(await db.storage.from('lineestate-originals').download(p.path));const path=`${draft.id}/${rev.id}/${i}.webp`;check(await db.storage.from('lineestate-public').upload(path,blob,{contentType:'image/webp',upsert:true}));photos.push({path,label:p.label,url:db.storage.from('lineestate-public').getPublicUrl(path).data.publicUrl});}
 check(await db.rpc('lineestate_approve',{revision:rev.id,public_photos:photos}));console.log(`Migrated: ${w.id} ${draft.number}`);
}
// Convert all currently registered/published photos, preserving originals and historical revisions.
const drafts=check(await db.from('lineestate_drafts').select('*'));
for(const draft of drafts){if(!draft.content.photos?.length||draft.content.photos.every(p=>p.path.endsWith('.webp')))continue;
 const candidate=structuredClone(draft.content);
 for(const [i,p]of candidate.photos.entries()){const raw=check(await db.storage.from('lineestate-originals').download(p.path));const rawPath=p.path;const path=`${draft.id}/normalized/${crypto.randomUUID()}.webp`;check(await db.storage.from('lineestate-originals').upload(path,await webpPhotoBuffer(Buffer.from(await raw.arrayBuffer())),{contentType:'image/webp',upsert:false}));p.path=path;delete p.originalPath;delete p.url;}
 const publication=check(await db.from('lineestate_published').select('*').eq('id',draft.id).maybeSingle());
 if(!publication){check(await db.from('lineestate_drafts').update({content:candidate,version:draft.version+1}).eq('id',draft.id).eq('version',draft.version));continue;}
 check(await db.from('lineestate_drafts').update({content:candidate,version:draft.version+1}).eq('id',draft.id).eq('version',draft.version));
 const photos=[];
 for(const [i,p]of publication.content.photos.entries()){
  const blob=check(await db.storage.from('lineestate-public').download(p.path));
  const path=`${draft.id}/normalized-public/${crypto.randomUUID()}.webp`;
  check(await db.storage.from('lineestate-public').upload(path,await webpPhotoBuffer(Buffer.from(await blob.arrayBuffer())),{contentType:'image/webp',upsert:false}));
  photos.push({path,label:p.label,url:db.storage.from('lineestate-public').getPublicUrl(path).data.publicUrl});
 }
 check(await db.from('lineestate_published').update({content:{...publication.content,photos}}).eq('id',draft.id));
 console.log(`Normalized: ${draft.number} ${photos.length} photos; publication text/status unchanged`);
}