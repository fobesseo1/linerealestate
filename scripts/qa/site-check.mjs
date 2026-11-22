// 이전 단계별 실제 사이트 시험 (docs/aws-이전-검색등록-계획.md). 읽기만 하고 아무것도 저장하지 않는다.
//
//   npm run check:site -- --base https://sanbon.lineestate.co.kr --stage server
//   --stage server    2단계: 새 서버가 페이지·그림·API·검사를 제대로 돌리는지
//   --stage services  3단계: 관리자 화면·카카오 복귀 주소가 새 주소에서 살아 있는지
//   --stage switch    4단계: 옛 주소(--legacy, 기본 Vercel)가 새 주소로 301 넘기는지
//   --stage search    5단계: 사이트맵·robots·소유확인 태그 (--expect naver,google,bing,daum / --indexnow-key KEY)
//   --stage all       위 전부 (switch는 --legacy가 base와 다를 때만)
//
// 문의 접수 API는 '가짜 문의 칸(website)'을 채워 보내서 DB에 닿기 전에 400으로 끝나게 한다 → 실제 문의가 생기지 않는다.
// 실패가 하나라도 있으면 종료 코드 1.

const args=process.argv.slice(2);
const opt=(name,fallback)=>{const i=args.indexOf(`--${name}`);return i>=0&&args[i+1]&&!args[i+1].startsWith('--')?args[i+1]:fallback;};
const base=(opt('base',process.env.NEXT_PUBLIC_SITE_URL||'https://linerealestate.vercel.app')).replace(/\/+$/,'');
// --site: 사이트가 자기 주소로 알고 있어야 하는 값(기본 base). 로컬에서 새 주소로 빌드한 서버를 시험할 때만 다르게 준다.
const site=(opt('site',base)).replace(/\/+$/,'');
const legacy=(opt('legacy','https://linerealestate.vercel.app')).replace(/\/+$/,'');
const stage=opt('stage','server');
const expect=new Set((opt('expect','')||'').split(',').map(s=>s.trim()).filter(Boolean));
const indexNowKey=opt('indexnow-key','');
const STAGES=['server','services','switch','search'];
if(stage!=='all'&&!STAGES.includes(stage)){console.error(`--stage는 ${[...STAGES,'all'].join('|')} 중 하나`);process.exit(2);}

const results=[];
async function check(name,fn){
 try{const note=await fn();results.push({ok:true,name});console.log(`  ✔ ${name}${note?` — ${note}`:''}`);}
 catch(e){results.push({ok:false,name});console.log(`  ✖ ${name} — ${e.message}`);}
}
const must=(cond,msg)=>{if(!cond)throw Error(msg);};
const get=(path,init={})=>fetch(path.startsWith('http')?path:`${base}${path}`,{redirect:'manual',...init,headers:{'user-agent':'sanbon-site-check',...(init.headers||{})}});
const text=async(path)=>{const r=await get(path);must(r.status===200,`${path} → ${r.status}`);return r.text();};

async function server(){
 console.log(`\n[2단계 server] ${base}${site!==base?` (사이트 주소 ${site})`:''}`);
 let home='';
 for(const path of ['/','/listings','/works','/compare','/process']){
  await check(`페이지 ${path} 200`,async()=>{const t0=Date.now();const body=await text(path);if(path==='/')home=body;must(body.includes('선부동산'),'선부동산 글자가 없음');return `${Date.now()-t0}ms`;});
 }
 await check('그림·CSS(_next/static) 200',async()=>{
  const css=home.match(/\/_next\/static\/[^"']+\.css/)?.[0];must(css,'홈 HTML에 CSS 주소가 없음');
  const r=await get(css);must(r.status===200,`${css} → ${r.status} (public·.next/static 복사 빠졌는지 확인)`);
  const logo=await get('/logo.svg');must(logo.status===200,`/logo.svg → ${logo.status}`);
 });
 await check('구조화 데이터(JSON-LD) 주소가 이 주소',async()=>{must(home.includes(`"url":"${site}"`),`JSON-LD url이 ${site}가 아님`);});
 await check('공개 매물 API /api/content/publications',async()=>{
  const r=await get('/api/content/publications');must(r.status===200,`→ ${r.status} (DB 연결·SUPABASE_GATE_TOKEN 확인)`);
  const list=await r.json();must(Array.isArray(list)&&list.length>0,'매물이 0건');return `${list.length}건`;
 });
 await check('매물 상세 페이지 열림',async()=>{
  const list=await (await get('/api/content/publications')).json();const item=list.find(i=>i.number);must(item,'번호 있는 매물 없음');
  const kind=item.content?.kind;const path=(kind==='case'||item.status==='completed')?`/works/${item.number}`:`/property/${item.number}`;
  const r=await get(path);must([200,308].includes(r.status),`${path} → ${r.status}`);return path;
 });
 await check('문의 API: 다른 사이트에서 오면 403',async()=>{
  const r=await get('/api/inquiries',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{"website":"x"}'});
  must(r.status===403,`→ ${r.status}`);
 });
 await check('문의 API: 이 주소에서 오면 통과(가짜 칸이라 400, 저장 안 됨)',async()=>{
  const r=await get('/api/inquiries',{method:'POST',headers:{origin:site,'content-type':'application/json'},body:'{"website":"x"}'});
  must(r.status===400,`→ ${r.status} (403이면 요청 출처 검사에 이 주소가 없음, 500이면 서버 설정)`);
 });
 await check('관리자 지도 API: 이 주소에서 로그인 없이 부르면 401(출처 검사 통과)',async()=>{
  const r=await get('/api/content/map',{method:'POST',headers:{origin:site,'content-type':'application/json'},body:'{}'});
  must(r.status===401,`→ ${r.status}`);
 });
}

async function services(){
 console.log(`\n[3단계 services] ${base}`);
 await check('관리자 화면 /admin/ 200 + 검색 제외',async()=>{
  let r=await get('/admin');if([301,308].includes(r.status))r=await get(new URL(r.headers.get('location'),base).href);
  must(r.status===200,`→ ${r.status}`);const body=await r.text();must(/noindex/.test(body),'noindex 없음');
 });
 await check('카카오 복귀 주소가 살아 있음(로그인 없이 부르면 관리자 화면으로 돌려보냄)',async()=>{
  const r=await get('/api/inquiries/kakao/callback');must(r.status>=300&&r.status<400,`→ ${r.status}`);
  const to=new URL(r.headers.get('location'),base);must(to.origin===site,`→ ${to.origin}로 감 (NEXT_PUBLIC_SITE_URL 확인)`);
 });
 console.log('  · 손으로 확인: Supabase Redirect URLs·카카오 Redirect URI·네이버 지도 Web 서비스 URL에 새 주소 추가, 관리자 로그인·알림 테스트 보내기');
}

async function switchCheck(){
 console.log(`\n[4단계 switch] ${legacy} → ${base}`);
 for(const path of ['/','/works?from=check','/property/SUN-1012','/admin/']){
  await check(`옛 주소 ${path} → 새 주소 301/308`,async()=>{
   const r=await get(`${legacy}${path}`);must([301,308].includes(r.status),`→ ${r.status}`);
   const to=r.headers.get('location')||'';must(to===`${base}${path}`,`→ ${to}`);
  });
 }
}

async function search(){
 console.log(`\n[5단계 search] ${base}`);
 await check('robots.txt: 이 주소 sitemap, /admin·/api 막음',async()=>{
  const body=await text('/robots.txt');
  must(body.includes(`Sitemap: ${site}/sitemap.xml`),'Sitemap 줄이 이 주소가 아님');
  must(/Disallow: \/admin/.test(body)&&/Disallow: \/api/.test(body),'Disallow 줄 없음');
  if(expect.has('daum'))must(/^#DaumWebMasterTool:/.test(body),'다음 인증 줄 없음(DAUM_WEBMASTER_TOKEN)');
 });
 await check('sitemap.xml: 모든 주소가 이 주소',async()=>{
  const locs=[...(await text('/sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  must(locs.length>5,`주소 ${locs.length}개뿐`);const bad=locs.filter(l=>!l.startsWith(`${site}/`)&&l!==site);
  must(!bad.length,`다른 주소 ${bad.length}개: ${bad[0]}`);return `${locs.length}개`;
 });
 const home=await text('/').catch(()=>'');
 const tags={google:'google-site-verification',naver:'naver-site-verification',bing:'msvalidate.01'};
 for(const [k,name] of Object.entries(tags))if(expect.has(k))await check(`소유확인 태그 ${name}`,async()=>{must(home.includes(`name="${name}"`),'없음');});
 if(indexNowKey)await check('IndexNow 키 파일',async()=>{must((await text(`/${indexNowKey}.txt`)).trim()===indexNowKey,'내용이 키와 다름');});
 await check('홈 설명이 상가 사이트',async()=>{must(/상가/.test(home.match(/name="description" content="([^"]*)"/)?.[1]||''),'description에 상가 없음');});
}

const run=stage==='all'?STAGES:[stage];
for(const s of run){
 if(s==='server')await server();
 if(s==='services')await services();
 if(s==='switch'){if(stage==='all'&&legacy===base)console.log('\n[4단계 switch] 건너뜀: --legacy가 base와 같음');else await switchCheck();}
 if(s==='search')await search();
}
const failed=results.filter(r=>!r.ok);
console.log(`\n${results.length-failed.length}/${results.length} 통과`);
process.exit(failed.length?1:0);
