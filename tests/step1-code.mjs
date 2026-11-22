// 1단계 코드 시험 (docs/aws-이전-검색등록-계획.md). 인터넷·DB 없이 몇 초 안에 끝난다.
//   npm run test:step1
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
import {LEGACY_ORIGIN,NEW_ORIGIN,LOCAL_ORIGIN,resolveSiteUrl,allowedOrigins,isAllowedOrigin} from '../lib/site-url.ts';
import {robotsText,verificationMeta} from '../lib/seo.ts';

const root=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const read=f=>readFileSync(join(root,f),'utf8');

test('site address: env value is used, bad values fall back to the old address',()=>{
 assert.equal(resolveSiteUrl(undefined),LEGACY_ORIGIN);
 assert.equal(resolveSiteUrl(''),LEGACY_ORIGIN);
 assert.equal(resolveSiteUrl(' https://sanbon.lineestate.co.kr/ '),NEW_ORIGIN);
 assert.equal(resolveSiteUrl('http://sanbon.lineestate.co.kr'),LEGACY_ORIGIN,'http는 받지 않는다');
 assert.equal(resolveSiteUrl('https://sanbon.lineestate.co.kr/admin'),LEGACY_ORIGIN,'경로가 붙은 값은 받지 않는다');
 assert.equal(resolveSiteUrl('not a url'),LEGACY_ORIGIN);
 assert.equal(resolveSiteUrl(LOCAL_ORIGIN),LOCAL_ORIGIN);
});

test('origin check: old and new address both work during the move',()=>{
 for(const current of [LEGACY_ORIGIN,NEW_ORIGIN]){
  assert.ok(isAllowedOrigin(LEGACY_ORIGIN,current,'production'));
  assert.ok(isAllowedOrigin(NEW_ORIGIN,current,'production'));
 }
});

test('origin check: other sites, missing origin and production localhost are refused',()=>{
 for(const bad of [null,'','https://evil.example','https://sanbon.lineestate.co.kr.evil.example','http://sanbon.lineestate.co.kr','https://lineestate.co.kr'])
  assert.equal(isAllowedOrigin(bad,NEW_ORIGIN,'production'),false,String(bad));
 assert.equal(isAllowedOrigin(LOCAL_ORIGIN,NEW_ORIGIN,'production'),false);
 assert.equal(isAllowedOrigin(LOCAL_ORIGIN,NEW_ORIGIN,'development'),true);
 assert.deepEqual(new Set(allowedOrigins(NEW_ORIGIN,'production')),new Set([LEGACY_ORIGIN,NEW_ORIGIN]));
});

test('robots.txt: blocks admin and api, points to this address, Daum line only when set',()=>{
 const plain=robotsText(NEW_ORIGIN);
 assert.match(plain,/^User-Agent: \*$/m);
 assert.match(plain,/^Disallow: \/admin$/m);
 assert.match(plain,/^Disallow: \/api$/m);
 assert.match(plain,new RegExp(`^Sitemap: ${NEW_ORIGIN}/sitemap.xml$`,'m'));
 assert.doesNotMatch(plain,/Daum/);
 const daum=robotsText(NEW_ORIGIN,' abc:123 ');
 assert.equal(daum.split('\n')[0],'#DaumWebMasterTool:abc:123');
});

test('ownership tags: only filled values are printed',()=>{
 assert.equal(verificationMeta({}),undefined);
 assert.equal(verificationMeta({GOOGLE_SITE_VERIFICATION:'  '}),undefined);
 assert.deepEqual(verificationMeta({NAVER_SITE_VERIFICATION:'n1',BING_SITE_VERIFICATION:'b1'}),{other:{'naver-site-verification':'n1','msvalidate.01':'b1'}});
 assert.deepEqual(verificationMeta({GOOGLE_SITE_VERIFICATION:'g1'}),{google:'g1'});
});

test('code wiring: standalone, robots route, origin check and site address are connected',()=>{
 assert.match(read('next.config.ts'),/output:\s*"standalone"/);
 assert.ok(!existsSync(join(root,'app/robots.ts')),'app/robots.ts와 app/robots.txt/route.ts가 같이 있으면 안 된다');
 assert.match(read('app/robots.txt/route.ts'),/robotsText\(site\.url/);
 assert.match(read('lib/site.ts'),/url:\s*siteUrl/);
 assert.match(read('lib/inquiries/server.ts'),/export const siteOrigin=siteUrl/);
 assert.match(read('lib/inquiries/server.ts'),/return isAllowedOrigin\(request\.headers\.get\("origin"\)\)/);
 assert.match(read('app/layout.tsx'),/verification:verificationMeta\(process\.env\)/);
});

test('no hard-coded site address left in app code (only lib/site-url.ts holds it)',()=>{
 const hits=[];
 const walk=d=>{for(const n of readdirSync(d)){const p=join(d,n);if(statSync(p).isDirectory())walk(p);else if(/\.(ts|tsx|mjs|js)$/.test(n)){
  const rel=relative(root,p).replaceAll('\\','/');if(rel==='lib/site-url.ts')continue;
  read(rel).split('\n').forEach((l,i)=>{if(/linerealestate\.vercel\.app|sanbon\.lineestate\.co\.kr/.test(l))hits.push(`${rel}:${i+1}`);});}}};
 for(const d of ['app','components','lib'])walk(join(root,d));
 assert.deepEqual(hits,[]);
});
