// 선부동산 지킴이 (2026-11-22). 1초 안에 끝난다. 실패하면 종료 코드 1, --hook이면 2(Claude Stop 훅이 받아서 고친다).
//   npm run test:guard
//
// 지키는 것
//   1) 비밀 키가 브라우저 코드로 새지 않는다: "use client" 파일에서 NEXT_PUBLIC_ 아닌 환경변수, 비밀 키 값(sb_secret_),
//      NEXT_PUBLIC_ 이름의 비밀값(…SECRET/SERVICE/PRIVATE/PASSWORD/TOKEN).
//   2) 현재 자료를 지우지 않는다 (2026-11-22 사용자): supabase/migrations에 drop table·truncate·delete from·drop schema 금지,
//      코드에서 DB 행 삭제(.delete())·저장소 파일 삭제(.remove()) 새로 쓰기 금지. 아래 ALLOWED_DELETES만 예외.
//   3) 사이트 주소는 lib/site-url.ts 한 곳에만 (app·components·lib).
//   4) 경매·lineestate 표를 건드리지 않는다: 코드가 쓰는 표는 lineestate_* / linerealestate_* 만.
// 꼭 써야 하는 줄이면 줄 끝에 `지킴이: 괜찮음 (이유)`를 적고 사용자에게 말한다.
import {readdirSync,readFileSync,statSync,existsSync} from "node:fs";
import {join,relative} from "node:path";

const hook=process.argv.includes("--hook");
const root=process.env.CLAUDE_PROJECT_DIR||process.cwd();
const OK="지킴이: 괜찮음";
const SKIP=new Set(["node_modules",".next",".git",".tmp",".next-pages"]);
// 기존 기능이라 허용: 관리자가 확인창을 거쳐 입점 기록 한 줄을 지움 / 사진 1200px 정리 때 원본 저장소 정리(2026-10 완료된 스크립트)
const ALLOWED_DELETES=new Set(["components/admin/deal-records-admin.tsx","scripts/normalize-stored-photos.mjs"]);

const list=(dir,re)=>{const out=[];const walk=d=>{for(const n of readdirSync(d)){if(SKIP.has(n))continue;const p=join(d,n);if(statSync(p).isDirectory())walk(p);else if(re.test(n))out.push(p);}};if(existsSync(dir))walk(dir);return out;};
const rel=p=>relative(root,p).replaceAll("\\","/");
const hits=[];
const scan=(files,rules,filter=()=>true)=>{for(const f of files){const r=rel(f);if(!filter(r))continue;const src=readFileSync(f,"utf8");src.split("\n").forEach((line,i)=>{if(line.includes(OK))return;for(const rule of rules)if((rule.when?.(r,src)??true)&&rule.re.test(line))hits.push(`${r}:${i+1}  ${rule.name}`);});}};

const code=[...list(join(root,"app"),/\.(ts|tsx|js|mjs)$/),...list(join(root,"components"),/\.(ts|tsx|js|mjs)$/),...list(join(root,"lib"),/\.(ts|tsx|js|mjs)$/)];
const scripts=list(join(root,"scripts"),/\.(mjs|js|ts)$/).filter(f=>!rel(f).startsWith("scripts/qa/")); // 검사 스크립트 자신은 규칙 글자를 담고 있어 뺀다
const isClient=(_,src)=>/^\s*["']use client["']/.test(src);

scan([...code,...scripts],[
 {name:"Supabase 비밀 키 값 (sb_secret_)",re:/sb_secret_[A-Za-z0-9_-]{6,}/},
 {name:"NEXT_PUBLIC_ 이름의 비밀값 (브라우저로 나간다)",re:/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE|PRIVATE|PASSWORD|TOKEN)\b/},
 {name:"브라우저 코드(use client)에서 서버 환경변수",re:/process\.env\.(?!NEXT_PUBLIC_|NODE_ENV)[A-Z]/,when:isClient},
 {name:"브라우저 코드(use client)에서 서버 전용 모듈",re:/from\s+["']@\/lib\/inquiries\/(server|notifications)["']/,when:isClient},
]);

scan([...code,...scripts],[
 {name:"DB 행 삭제 .delete() (현재 자료 지우기 금지)",re:/\.delete\(\s*\)/},
 {name:"저장소 파일 삭제 .remove( (현재 자료 지우기 금지)",re:/storage\s*\.from\([^)]*\)\s*\.remove\(|\.remove\(\s*\[/},
],r=>!ALLOWED_DELETES.has(r));

scan(list(join(root,"supabase"),/\.sql$/),[
 {name:"마이그레이션에서 자료 지우기 (drop table·truncate·delete from·drop schema)",re:/\b(drop\s+table|truncate|delete\s+from|drop\s+schema)\b/i},
]);

scan(code,[
 {name:"사이트 주소를 코드에 직접 씀 (lib/site-url.ts만)",re:/linerealestate\.vercel\.app|sanbon\.lineestate\.co\.kr/},
],r=>r!=="lib/site-url.ts");

scan([...code,...scripts],[
 {name:"선부동산 표가 아님 (lineestate_*·linerealestate_*만)",re:/\.(from|rpc)\(\s*["'](?!lineestate|linerealestate)[a-z_]+["']/},
],r=>!/storage/.test(r));
// storage.from('버킷')은 위 규칙에 걸리지 않게 따로 본다
const BUCKET=/storage\s*\.from\(\s*["'](?!lineestate-)[a-z-]+["']/;
for(const f of [...code,...scripts])readFileSync(f,"utf8").split("\n").forEach((l,i)=>{if(!l.includes(OK)&&BUCKET.test(l))hits.push(`${rel(f)}:${i+1}  선부동산 버킷이 아님 (lineestate-*만)`);});

// .from(...)이 storage.from인 줄은 표 규칙에서 빼 준다
const real=hits.filter(h=>!(h.endsWith("선부동산 표가 아님 (lineestate_*·linerealestate_*만)")&&/storage\s*\.from/.test(readFileSync(join(root,h.split(":")[0]),"utf8").split("\n")[Number(h.split(":")[1])-1])));

if(!real.length){if(!hook)console.log("지킴이 통과");process.exit(0);}
const msg=`지킴이 실패 ${real.length}건 (scripts/qa/guard-check.mjs):\n${real.map(h=>`  - ${h}`).join("\n")}`;
if(hook){process.stderr.write(msg+"\n");process.exit(2);}
console.error(msg);process.exit(1);
