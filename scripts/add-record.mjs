// Local agent bridge: adds one contract to the yearly store record (lineestate_deal_records).
// Usage:
//   node scripts/add-record.mjs --month 2026-11 --name "상호" --industry 카페 --link "<naver.me or map.naver.com link>"
//        [--type lease|sale|transfer] [--case SUN-1005] [--dry-run] [--name-ok]
// Industries: 음식점 주점 카페 미용 병원·의료 학원·스터디 PC카페 스포츠 기타
// The link is checked against Naver, stored as a place page (opens on phones), and the
// store photo is filled afterwards by scripts/record-photos.mjs.
import {execFileSync} from 'node:child_process';
import {createClient} from '@supabase/supabase-js';
process.loadEnvFile('.env.local');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
if(!url||!secret||!secret.startsWith('sb_secret_'))throw Error('Local content credentials unavailable');
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});

const args=process.argv.slice(2),option=key=>{const i=args.indexOf(`--${key}`);return i>=0?args[i+1]?.trim():undefined;};
const month=option('month'),name=option('name'),industry=option('industry')||'',link=option('link'),type=option('type')||'lease',caseNumber=(option('case')||'').toUpperCase(),dryRun=args.includes('--dry-run');
const industries=['음식점','주점','카페','미용','병원·의료','학원·스터디','PC카페','스포츠','기타'];
if(!month||!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('--month 는 2026-11 형식이어야 합니다.');
if(!name)throw Error('--name 에 상호를 넣어 주세요.');
if(industry&&!industries.includes(industry))throw Error(`--industry 는 다음 중 하나: ${industries.join(', ')}`);
if(!['lease','sale','transfer'].includes(type))throw Error('--type 은 lease, sale, transfer 중 하나입니다.');
if(caseNumber&&!/^SUN-\d+$/.test(caseNumber))throw Error('--case 는 SUN-1005 형식입니다.');
if(!link)throw Error('--link 에 네이버 지도 링크를 넣어 주세요.');

const browser='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const placeId=address=>{const u=new URL(address);return ['map.naver.com','m.place.naver.com','pcmap.place.naver.com'].includes(u.hostname)?u.pathname.match(/\/(?:place|restaurant|hairshop|hospital|accommodation)\/(\d+)/)?.[1]:undefined;};
let id=placeId(link);
if(!id){
 const short=new URL(link);
 if(short.hostname!=='naver.me')throw Error('naver.me 또는 map.naver.com 링크만 넣을 수 있습니다.');
 const response=await fetch(short,{redirect:'manual',signal:AbortSignal.timeout(10000)});
 id=placeId(response.headers.get('location')||'');
}
if(!id)throw Error('링크에서 네이버 장소 번호를 찾지 못했습니다.');
const mapUrl=`https://m.place.naver.com/place/${id}/home`;
const page=await (await fetch(mapUrl,{headers:{'User-Agent':browser},signal:AbortSignal.timeout(15000)})).text();
const naverName=page.match(new RegExp(`"id":"${id}","name":"([^"]+)"`))?.[1]||page.match(/"name":"([^"]+)"/)?.[1]||'?';
console.log(`네이버 장소: ${naverName} (${mapUrl})`);
console.log(`입력 상호:   ${name}`);
// Stop when the link points at a different store; names like "카페 코니" / "카페코니" still match.
const plain=value=>value.replace(/[\s·()]/g,'').replace(/(산본|점|의원)$/g,'').toLowerCase();
if(!plain(naverName).includes(plain(name))&&!plain(name).includes(plain(naverName))&&!args.includes('--name-ok'))
 throw Error('링크의 네이버 상호와 입력한 상호가 다릅니다. 링크를 다시 확인하거나, 같은 가게가 맞으면 --name-ok 를 붙여 다시 실행하세요.');

const existing=await db.from('lineestate_deal_records').select('id,name,map_url,sort_order').eq('contracted_month',month);
if(existing.error)throw Error(existing.error.message);
const duplicate=existing.data.find(r=>r.name===name||r.map_url===mapUrl);
if(duplicate)throw Error(`이미 등록된 기록입니다: ${month} ${duplicate.name}`);
const row={contracted_month:month,name,industry,deal_type:type,map_url:mapUrl,case_number:caseNumber,sort_order:Math.max(0,...existing.data.map(r=>r.sort_order))+1};
if(dryRun){console.log('미리보기만 했습니다 (--dry-run):',row);process.exit(0);}
const saved=await db.from('lineestate_deal_records').insert(row).select('id').single();
if(saved.error)throw Error(saved.error.message);
console.log(`등록했습니다: ${month} ${name} (${saved.data.id})`);
execFileSync(process.execPath,['scripts/record-photos.mjs'],{stdio:'inherit'});
console.log('공개 화면(/works, 홈 입점 기록)에는 30초 안에 반영됩니다.');
