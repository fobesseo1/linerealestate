// Explicit user request: store only normalized 1200px WebP images, including revision history.
import {createClient} from '@supabase/supabase-js';
import {webpPhotoBuffer} from '../lib/content/photo-node.mjs';
import {writeFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
const check=r=>{if(r.error)throw Error(r.error.message);return r.data;};
const conversions=new Map(),used=new Set();
async function normalize(content){
 const result=structuredClone(content);
 for(const p of result.photos||[]){
  const old=p.path;delete p.originalPath;delete p.localFile;delete p.url;
  let path=conversions.get(old);
  if(!path){const blob=check(await db.storage.from('lineestate-originals').download(old));const bytes=Buffer.from(await blob.arrayBuffer());const output=await webpPhotoBuffer(bytes);
   if(old.endsWith('.webp')&&output===bytes)path=old;
   else{path=`${old.split('/')[0]}/webp-only/${crypto.randomUUID()}.webp`;check(await db.storage.from('lineestate-originals').upload(path,output,{contentType:'image/webp',upsert:false}));}
   conversions.set(old,path);
  }
  p.path=path;used.add(path);
 }
 return result;
}
const drafts=check(await db.from('lineestate_drafts').select('*'));
for(const d of drafts){const content=await normalize(d.content);if(JSON.stringify(content)!==JSON.stringify(d.content))check(await db.from('lineestate_drafts').update({content,version:d.version+1}).eq('id',d.id).eq('version',d.version));}
const revisions=check(await db.from('lineestate_revisions').select('*'));
for(const r of revisions){const original=await normalize(r.original),candidate=await normalize(r.candidate);check(await db.from('lineestate_revisions').update({original,candidate}).eq('id',r.id));}
// A conversion can invalidate pending base versions: retain them as history, never silently approve.
// Only non-WebP files are removed; every image referenced by content is normalized first.
async function walk(prefix=''){
 const result=[];for(let offset=0;;offset+=100){const rows=check(await db.storage.from('lineestate-originals').list(prefix,{limit:100,offset}));for(const row of rows){const path=prefix?`${prefix}/${row.name}`:row.name;if(row.id)result.push(path);else result.push(...await walk(path));}if(rows.length<100)break;}return result;
}
const preserveExisting=!process.argv.includes('--delete-unconverted-human-approved');const files=preserveExisting?[]:await walk();const remove=files.filter(path=>!path.endsWith('.webp')&&!used.has(path));
for(let i=0;i<remove.length;i+=100)check(await db.storage.from('lineestate-originals').remove(remove.slice(i,i+100)));
await writeFile('.tmp/content/migration/photo-format-report.json',JSON.stringify({drafts:drafts.length,revisions:revisions.length,referencedWebpFiles:used.size,removedUnconvertedFiles:remove.length},null,2));
console.log(JSON.stringify({drafts:drafts.length,revisions:revisions.length,referencedWebpFiles:used.size,removedUnconvertedFiles:remove.length}));
