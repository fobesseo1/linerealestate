// 1단계 전체 시험: AWS 서버와 같은 방식(standalone)으로 빌드해 띄우고 site-check(server·search)를 돌린다 (2026-11-22).
//   npm run check:standalone              → 빌드 + 실행 + 시험 (몇 분)
//   npm run check:standalone -- --no-build → 이미 만든 .next/standalone으로 실행 + 시험
// 새 주소(NEXT_PUBLIC_SITE_URL=https://sanbon.lineestate.co.kr)로 빌드해서 sitemap·robots·JSON-LD가 새 주소로 나오는지도 본다.
// 실제 DB는 읽기만 한다 (.env.local 값 사용). 문의 시험은 가짜 칸이라 저장되지 않는다.
// 포트 3011을 쓴다 (3010은 개발 서버, 3000은 다른 프로젝트).
import {spawn,spawnSync} from "node:child_process";
import {cpSync,existsSync,readFileSync,rmSync} from "node:fs";
import {join} from "node:path";

const root=process.cwd();
const PORT="3011";
const SITE="https://sanbon.lineestate.co.kr";
const env={...process.env};
// .env.local 값(이름만 고름)을 실행 환경으로. 화면에 찍지 않는다.
if(existsSync(join(root,".env.local")))for(const line of readFileSync(join(root,".env.local"),"utf8").split(/\r?\n/)){
 const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&!(m[1] in env))env[m[1]]=m[2].replace(/^["']|["']$/g,"");
}
env.NEXT_PUBLIC_SITE_URL=SITE;

// 먼저 DB 문 암호(SUPABASE_GATE_TOKEN)가 받아들여지는지 본다. 값은 찍지 않는다.
{
 const cfg=JSON.parse(readFileSync(join(root,"lib/content/public-config.json"),"utf8"));
 const r=await fetch(`${cfg.url}/rest/v1/lineestate_published?select=number&limit=1`,{headers:{apikey:cfg.publishableKey,authorization:`Bearer ${cfg.publishableKey}`,...(env.SUPABASE_GATE_TOKEN?{"x-ls-gate":env.SUPABASE_GATE_TOKEN.trim()}:{})}}).catch(()=>null);
 if(!r||r.status!==200){
  console.error(`\n✖ 미리 확인: DB가 이 컴퓨터의 SUPABASE_GATE_TOKEN을 받지 않음 (${r?r.status:"연결 실패"}).`);
  console.error("  .env.local의 SUPABASE_GATE_TOKEN을 Vercel(Production)과 같은 값으로 직접 바꾼 뒤 다시 돌리세요. 매물·사이트맵 시험이 이것 때문에 실패합니다.\n");
  if(!process.argv.includes("--keep-going"))process.exit(1);
 }
}

const sh=(cmd,extra={})=>{const r=spawnSync(cmd,{cwd:root,stdio:"inherit",shell:true,env:{...env,...extra}});if(r.status!==0){console.error(`실패: ${cmd}`);process.exit(1);}};
const out=join(root,".next","standalone");
if(!process.argv.includes("--no-build")){
 sh("npx next build");
 cpSync(join(root,"public"),join(out,"public"),{recursive:true});
 cpSync(join(root,".next","static"),join(out,".next","static"),{recursive:true});
}
if(!existsSync(join(out,"server.js"))){console.error(".next/standalone/server.js 없음 — output: \"standalone\" 확인");process.exit(1);}

const server=spawn(process.execPath,["server.js"],{cwd:out,env:{...env,PORT,HOSTNAME:"127.0.0.1",NODE_ENV:"production"},stdio:["ignore","pipe","pipe"]});
let log="";server.stdout.on("data",d=>log+=d);server.stderr.on("data",d=>log+=d);
const local=`http://127.0.0.1:${PORT}`;
let up=false;for(let i=0;i<60&&!up;i++){await new Promise(r=>setTimeout(r,500));up=await fetch(`${local}/robots.txt`).then(r=>r.ok).catch(()=>false);}
if(!up){console.error("서버가 30초 안에 뜨지 않음\n"+log.slice(-2000));server.kill();process.exit(1);}

// 로컬 서버는 새 주소 이름으로 돌고 있으므로, site-check가 base를 로컬로 부르되 '이 주소'는 새 주소로 보게 한다.
const r=spawnSync(process.execPath,["scripts/qa/site-check.mjs","--base",local,"--site",SITE,"--stage","server"],{cwd:root,stdio:"inherit",env});
const r2=spawnSync(process.execPath,["scripts/qa/site-check.mjs","--base",local,"--site",SITE,"--stage","search"],{cwd:root,stdio:"inherit",env});
server.kill();
if(/Error|error/.test(log))console.log("\n서버 기록에 오류 글자가 있음 (아래 마지막 부분):\n"+log.split("\n").filter(l=>/error/i.test(l)).slice(-10).join("\n"));
process.exit((r.status||r2.status)?1:0);
