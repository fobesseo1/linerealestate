// 지킴이(scripts/qa/guard-check.mjs)가 실제로 잡는지 가짜 폴더로 시험한다.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

const guard=new URL('../scripts/qa/guard-check.mjs',import.meta.url);
function run(files,hook=false){
 const dir=mkdtempSync(join(tmpdir(),'sanbon-guard-'));
 try{
  for(const [path,body] of Object.entries(files)){const p=join(dir,path);mkdirSync(join(p,'..'),{recursive:true});writeFileSync(p,body);}
  const r=spawnSync(process.execPath,[guard.pathname.replace(/^\/([A-Za-z]:)/,'$1'),...(hook?['--hook']:[])],{env:{...process.env,CLAUDE_PROJECT_DIR:dir},encoding:'utf8'});
  return {code:r.status,out:r.stdout+r.stderr};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
const clean={'lib/site-url.ts':'export const NEW_ORIGIN="https://sanbon.lineestate.co.kr";','lib/a.ts':'db.from("lineestate_published");'};

test('clean code passes',()=>{assert.equal(run(clean).code,0);});
test('hook mode fails with code 2 so Claude fixes it',()=>{const r=run({...clean,'lib/b.ts':'x.from("lineestate_drafts").delete();'},true);assert.equal(r.code,2);assert.match(r.out,/DB 행 삭제/);});
const cases={
 'DB 행 삭제':{'lib/b.ts':'await db.from("lineestate_drafts").delete().eq("id",1);'},
 '저장소 파일 삭제':{'scripts/x.mjs':"await db.storage.from('lineestate-public').remove([p]);"},
 '마이그레이션에서 자료 지우기':{'supabase/migrations/1.sql':'drop table public.lineestate_published;'},
 '사이트 주소를 코드에 직접 씀':{'app/x.ts':'const u="https://linerealestate.vercel.app";'},
 '선부동산 표가 아님':{'lib/c.ts':'db.from("auction_items").select("*");'},
 '선부동산 버킷이 아님':{'lib/d.ts':'db.storage.from("auction-photos").list();'},
 'NEXT_PUBLIC_ 이름의 비밀값':{'lib/e.ts':'process.env.NEXT_PUBLIC_KAKAO_SECRET;'},
 '브라우저 코드(use client)에서 서버 환경변수':{'components/f.tsx':'"use client";\nconst k=process.env.SUPABASE_SECRET_KEY;'},
 '브라우저 코드(use client)에서 서버 전용 모듈':{'components/g.tsx':'"use client";\nimport {serverDB} from "@/lib/inquiries/server";'},
};
for(const [name,files] of Object.entries(cases))test(`catches: ${name}`,()=>{const r=run({...clean,...files});assert.equal(r.code,1,r.out);assert.ok(r.out.includes(name),r.out);});
test('a marked line is allowed',()=>{assert.equal(run({...clean,'lib/h.ts':'db.from("lineestate_drafts").delete(); // 지킴이: 괜찮음 (시험)'}).code,0);});
test('existing allowed admin delete stays allowed',()=>{assert.equal(run({...clean,'components/admin/deal-records-admin.tsx':'db.from("lineestate_deal_records").delete().eq("id",1);'}).code,0);});
test('storage.from with a sanbon bucket is not mistaken for a table',()=>{assert.equal(run({...clean,'lib/i.ts':'db.storage.from("lineestate-public").getPublicUrl(p);'}).code,0);});
