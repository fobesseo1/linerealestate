// Local agent bridge. Never import this file from browser code.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {cleanContent} from '../lib/content/types.ts';
import {mapAddress,matchCoordinates} from '../lib/maps/address.mjs';
process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!secret||!secret.startsWith('sb_secret_'))throw Error('Local content credentials unavailable');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const [command,reference,file]=process.argv.slice(2);
const check=result=>{if(result.error)throw Error(result.error.message);return result.data;};
const getDraft=async number=>check(await db.from('lineestate_drafts').select('*').eq('number',number).single());
const verifyPhoto=(photo,id)=>{if(!photo.path.startsWith(`${id}/`)||photo.path.includes('..'))throw Error('Photo does not belong to this draft');};
async function locate(content){
 if(!content.showMap||!content.address)return;
 delete content.latitude;delete content.longitude;
 const id=process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID,key=process.env.NAVER_MAP_CLIENT_SECRET;
 if(!id||!key)return;
 const target=new URL('https://maps.apigw.ntruss.com/map-geocode/v2/geocode');target.searchParams.set('query',mapAddress(content.address));
 const response=await fetch(target,{headers:{'x-ncp-apigw-api-key-id':id,'x-ncp-apigw-api-key':key},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error(`Address verification failed: HTTP ${response.status}`);
 const data=await response.json();const position=matchCoordinates(mapAddress(content.address),data.addresses||[]);
 if(position){content.latitude=position.latitude;content.longitude=position.longitude;}
}
if(command==='export'){
 const draft=await getDraft(reference);const folder=resolve('.tmp','content',draft.number);await mkdir(folder,{recursive:true});
 const photos=[];
 for(const [i,p]of draft.content.photos.entries()){
  verifyPhoto(p,draft.id);const blob=check(await db.storage.from('lineestate-originals').download(p.path));
  const localFile=join(folder,`${i+1}-${p.path.split('/').pop()}`);await writeFile(localFile,Buffer.from(await blob.arrayBuffer()));photos.push({...p,localFile});
 }
 const exported={number:draft.number,baseVersion:draft.version,content:{...draft.content,photos},summary:'',privateNotes:draft.private_notes};
 await writeFile(join(folder,'original.json'),JSON.stringify(exported,null,2)+'\n');
 console.log(`Original exported privately: ${join(folder,'original.json')}`);
}else if(command==='revise'){
 const draft=await getDraft(reference),input=JSON.parse(await readFile(file,'utf8'));
 if(input.number!==draft.number||input.baseVersion!==draft.version)throw Error('Reference/version mismatch; export the current draft first');
 const candidate=cleanContent(input.content);
 for(const photo of candidate.photos){
  verifyPhoto(photo,draft.id);
  if(photo.localFile){
   const bytes=await readFile(photo.localFile);const ext=photo.localFile.split('.').pop().toLowerCase();
   const mime={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext];
   if(!mime||bytes.length>15*1024*1024)throw Error('Invalid photo format or size');
   const path=`${draft.id}/${crypto.randomUUID()}.${ext}`;check(await db.storage.from('lineestate-originals').upload(path,bytes,{contentType:mime,upsert:false}));photo.path=path;
  }
  delete photo.localFile;delete photo.url;
 }
 await locate(candidate);
 const revision=check(await db.from('lineestate_revisions').insert({draft_id:draft.id,base_version:draft.version,original:draft.content,candidate,summary:input.summary||'채팅에서 준비한 보정안'}).select('id').single());
 console.log(`Revision saved for approval: ${revision.id}. Nothing published.`);
}else if(command==='publish'){
 if(file!=='--human-approved')throw Error('Publishing requires explicit human approval and --human-approved');
 const revision=check(await db.from('lineestate_revisions').select('*').eq('id',reference).single());
 const draft=check(await db.from('lineestate_drafts').select('*').eq('id',revision.draft_id).single());
 if(revision.state!=='pending'||revision.base_version!==draft.version)throw Error('Stale or already resolved revision');
 if(!revision.candidate.title?.trim()||!revision.candidate.description?.trim())throw Error('Title and description required');
 const photos=[];
 for(const [i,p]of revision.candidate.photos.entries()){
  verifyPhoto(p,draft.id);const blob=check(await db.storage.from('lineestate-originals').download(p.path));
  const path=`${draft.id}/${revision.id}/${i}-${p.path.split('/').pop()}`;check(await db.storage.from('lineestate-public').upload(path,blob,{contentType:blob.type,upsert:true}));
  photos.push({path,label:p.label,url:db.storage.from('lineestate-public').getPublicUrl(path).data.publicUrl});
 }
 check(await db.rpc('lineestate_approve',{revision:revision.id,public_photos:photos}));console.log(`Approved revision published: ${draft.number}`);
}else throw Error('Usage: export SUN-1001 | revise SUN-1001 file.json | publish revision-id --human-approved');
