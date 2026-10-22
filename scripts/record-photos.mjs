// Local agent bridge: fills in one store photo per contract record from its Naver place page.
// Usage: node scripts/record-photos.mjs [--force]   (--force replaces photos that already exist)
// The representative photo (og:image) is downloaded at original size, normalized to a 1200px WebP
// and stored only in the public bucket (records/<id>.webp). No raw original is kept.
import {createClient} from '@supabase/supabase-js';
import {webpPhotoBuffer} from '../lib/content/photo-node.mjs';
process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!secret||!secret.startsWith('sb_secret_'))throw Error('Local content credentials unavailable');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const force=process.argv.includes('--force');
const browser='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

async function placePhoto(mapUrl){
 const page=await fetch(mapUrl,{headers:{'User-Agent':browser},signal:AbortSignal.timeout(15000)});
 const html=await page.text();
 const og=html.match(/property="og:image"\s+content="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');
 if(!og)return null;
 // og:image is a cropped search thumbnail; its src parameter is the original photo, aspect ratio intact.
 const source=new URL(og).searchParams.get('src')||og;
 const host=new URL(source).hostname;
 if(!host.endsWith('.pstatic.net'))throw Error(`Unexpected photo host ${host}`);
 const image=await fetch(source,{headers:{'User-Agent':browser,Referer:'https://m.place.naver.com/'},signal:AbortSignal.timeout(20000)});
 if(!image.ok)throw Error(`Photo download failed: HTTP ${image.status}`);
 return Buffer.from(await image.arrayBuffer());
}

const {data:records,error}=await db.from('lineestate_deal_records').select('id,name,map_url,photo_path').neq('map_url','');
if(error)throw Error(error.message);
let added=0;const missing=[];
for(const record of records){
 if(record.photo_path&&!force)continue;
 try{
  const original=await placePhoto(record.map_url);
  if(!original){missing.push(`${record.name} (대표 사진 없음)`);continue;}
  const path=`records/${record.id}.webp`;
  const upload=await db.storage.from('lineestate-public').upload(path,await webpPhotoBuffer(original),{contentType:'image/webp',upsert:true});
  if(upload.error)throw Error(upload.error.message);
  const saved=await db.from('lineestate_deal_records').update({photo_path:path,updated_at:new Date().toISOString()}).eq('id',record.id);
  if(saved.error)throw Error(saved.error.message);
  added++;console.log(`saved  ${record.name}`);
 }catch(reason){missing.push(`${record.name} (${reason instanceof Error?reason.message:reason})`);}
}
console.log(`\n${added} photos saved.`);
if(missing.length)console.log(`Not saved:\n - ${missing.join('\n - ')}`);
