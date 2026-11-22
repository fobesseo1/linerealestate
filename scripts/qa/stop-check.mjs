// Claude가 일을 끝낼 때(Stop 훅, .claude/settings.json) 코드가 바뀌었으면 타입 검사 + 단위 시험을 돌린다 (2026-11-22).
// - .ts/.tsx/.mjs/.json 파일이 바뀐 게 없으면 바로 끝낸다.
// - 바뀐 내용이 지난번 통과 때와 같으면 다시 돌리지 않는다.
// - 실패하면 종료 코드 2 → Claude가 오류를 받아 고친다. 같은 대화에서 3번 넘게 실패하면 멈추고 사용자에게 넘긴다.
//   직접 돌리기: echo {} | node scripts/qa/stop-check.mjs
import {execSync,spawnSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

const root=process.env.CLAUDE_PROJECT_DIR||process.cwd();
let input={};try{input=JSON.parse(readFileSync(0,"utf8")||"{}");}catch{}

const changed=execSync("git status --porcelain --untracked-files=all",{cwd:root,encoding:"utf8"})
 .split("\n").map(l=>l.slice(3).trim().replace(/^"|"$/g,""))
 .filter(f=>/\.(ts|tsx|mjs|json)$/.test(f)&&!f.startsWith("node_modules/")&&!f.startsWith(".claude/")&&!f.startsWith(".tmp/"));
if(!changed.length)process.exit(0);

const h=createHash("sha1");
for(const f of changed.sort()){h.update(f);const p=join(root,f);if(existsSync(p))h.update(readFileSync(p));}
const digest=h.digest("hex");
const key=createHash("sha1").update(root).digest("hex").slice(0,12);
const passFile=join(tmpdir(),`sanbon-stopcheck-pass-${key}`);
const failFile=join(tmpdir(),`sanbon-stopcheck-fail-${key}-${input.session_id||"x"}`);
if(existsSync(passFile)&&readFileSync(passFile,"utf8")===digest)process.exit(0);

const steps=[
 ["타입 검사 (npx tsc --noEmit)","npx tsc --noEmit"],
 ["단위 시험 (npm run test:unit)","npm run test:unit --silent"],
];
for(const [what,cmd] of steps){
 const r=spawnSync(cmd,{cwd:root,encoding:"utf8",shell:true});
 if(r.status!==0){
  const fails=(existsSync(failFile)?Number(readFileSync(failFile,"utf8"))||0:0)+1;writeFileSync(failFile,String(fails));
  const out=(r.stdout+r.stderr).split("\n").filter(l=>/error|✖|fail|Error|assert/i.test(l)).slice(0,30).join("\n")||(r.stdout+r.stderr).slice(-3000);
  if(fails>3){process.stderr.write(`${what} 실패가 ${fails}번째입니다. 자동 수정을 멈추고 사용자에게 알리세요.\n${out}\n`);process.exit(0);}
  process.stderr.write(`${what} 실패 — 고친 뒤 끝내세요:\n${out}\n`);process.exit(2);
 }
}
writeFileSync(passFile,digest);if(existsSync(failFile))rmSync(failFile);
process.exit(0);
