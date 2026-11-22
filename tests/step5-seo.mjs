// 5단계 검색 시험 (docs/검색-등록-제안.md). 인터넷·DB 없이 끝난다.
//   npm run test:step5
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {photoAlt,listingJsonLd,rssXml,indexNowBody,canSubmitIndexNow,INDEXNOW_KEY} from '../lib/seo.ts';

const root=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
const read=f=>readFileSync(join(root,f),'utf8');
const SITE='https://sanbon.lineestate.co.kr';
const base={kind:'lease',title:'산본동 1층 코너 상가 임대',description:'산본중심상가  1층\n코너 상가예요.',address:'산본동 1130-1 비전빌딩',locality:'산본동',showMap:true,deposit:'1000',rent:'55',salePrice:'',area:'33',floor:'1',photos:[{label:'11-sanbon-area.webp',url:'https://x/0.webp'},{label:'내부',url:'https://x/1.webp'}]};
const item=(c={},extra={})=>({number:'SUN-1',status:'active',published_at:'2026-11-20T01:00:00Z',content:{...base,...c},...extra});

test('photo alt: file names become "title 사진 n", real labels are kept with the title',()=>{
 assert.equal(photoAlt('11-sanbon-area.webp','점포',0),'점포 사진 1');
 assert.equal(photoAlt('IMG_2031.JPG','점포',2),'점포 사진 3');
 assert.equal(photoAlt('','점포',1),'점포 사진 2');
 assert.equal(photoAlt(' 내부 ','점포',0),'점포 - 내부');
});

test('listing JSON-LD: lease has 월세·보증금 in won, address, area, images, breadcrumb',()=>{
 const [listing,crumb]=listingJsonLd(item(),SITE);
 assert.equal(listing['@type'],'RealEstateListing');
 assert.equal(listing.url,`${SITE}/property/SUN-1`);
 assert.equal(listing.offers.price,550000);
 assert.deepEqual(listing.offers.priceSpecification.map(s=>[s.name,s.price]),[['월세',550000],['보증금',10000000]]);
 assert.equal(listing.offers.businessFunction,'http://purl.org/goodrelations/v1#LeaseOut');
 assert.equal(listing.about.address.streetAddress,'산본동 1130-1 비전빌딩');
 assert.equal(listing.about.floorSize.value,33);
 assert.deepEqual(listing.image,['https://x/0.webp','https://x/1.webp']);
 assert.equal(listing.description,'산본중심상가 1층 코너 상가예요.');
 assert.equal(listing.offers.seller['@id'],`${SITE}/#office`);
 assert.equal(crumb['@type'],'BreadcrumbList');
 assert.deepEqual(crumb.itemListElement.map(x=>x.item),[`${SITE}/`,`${SITE}/listings`,`${SITE}/property/SUN-1`]);
});

test('listing JSON-LD: hidden address never leaks, only 동 is shown',()=>{
 const [listing]=listingJsonLd(item({showMap:false}),SITE);
 assert.equal(listing.about.address.streetAddress,'산본동');
 assert.ok(!JSON.stringify(listing).includes('비전빌딩'));
});

test('listing JSON-LD: blank values are left out, nothing is invented',()=>{
 const [listing]=listingJsonLd(item({rent:'',deposit:'',area:'',photos:[]}),SITE);
 assert.equal(listing.offers.price,undefined);
 assert.equal(listing.offers.priceSpecification,undefined);
 assert.equal(listing.about.floorSize,undefined);
 assert.equal(listing.image,undefined);
});

test('listing JSON-LD: sale uses 매매가, completed shows sold out, case pages only get a breadcrumb',()=>{
 const [sale]=listingJsonLd(item({kind:'sale',salePrice:'25500',rent:'',deposit:''}),SITE);
 assert.equal(sale.offers.price,255000000);
 assert.equal(sale.offers.businessFunction,'http://purl.org/goodrelations/v1#Sell');
 assert.equal(listingJsonLd(item({},{status:'completed'}),SITE)[0].offers.availability,'https://schema.org/SoldOut');
 const work=listingJsonLd(item({kind:'work'}),SITE);
 assert.equal(work.length,1);
 assert.equal(work[0]['@type'],'BreadcrumbList');
 assert.equal(work[0].itemListElement[2].item,`${SITE}/works/SUN-1`);
});

test('RSS: newest first, limited, escaped, full URLs',()=>{
 const items=[item({title:'A & <B>'},{number:'SUN-1',published_at:'2026-11-01T00:00:00Z'}),item({},{number:'SUN-2',published_at:'2026-11-20T00:00:00Z'}),item({kind:'work'},{number:'SUN-3',published_at:'2026-10-01T00:00:00Z'})];
 const out=rssXml(items,SITE,'선부동산',2);
 assert.match(out,/^<\?xml version="1.0" encoding="UTF-8"\?><rss version="2.0">/);
 assert.ok(out.indexOf('SUN-2')<out.indexOf('SUN-1'),'newest first');
 assert.ok(!out.includes('SUN-3'),'limit applies');
 assert.ok(out.includes('A &amp; &lt;B&gt; (SUN-1)'));
 assert.ok(out.includes(`<link>${SITE}/property/SUN-2</link>`));
 assert.ok(!/<B>/.test(out));
});

test('IndexNow: body uses the site host, key file and full URLs; only the public address submits',()=>{
 const body=indexNowBody(SITE,INDEXNOW_KEY,['/','/property/SUN-1','/property/SUN-1','https://evil.example/x']);
 assert.equal(body.host,'sanbon.lineestate.co.kr');
 assert.equal(body.keyLocation,`${SITE}/${INDEXNOW_KEY}.txt`);
 assert.deepEqual(body.urlList,[`${SITE}/`,`${SITE}/property/SUN-1`]);
 assert.equal(canSubmitIndexNow(SITE),true);
 for(const bad of ['https://linerealestate.vercel.app','http://localhost:3010','http://sanbon.lineestate.co.kr','nope'])assert.equal(canSubmitIndexNow(bad),false,bad);
 assert.match(INDEXNOW_KEY,/^[0-9a-f]{32}$/);
 assert.equal(read(`public/${INDEXNOW_KEY}.txt`),INDEXNOW_KEY,'key file must hold exactly the key');
});

test('wiring: pages, gallery, title, RSS, IndexNow calls and crawlable page links are connected',()=>{
 for(const p of ['app/(site)/property/[number]/page.tsx','app/(site)/works/[number]/page.tsx']){
  const s=read(p);assert.match(s,/listingJsonLd\(item,site\.url\)/);assert.match(s,/replace\(\/<\/g,"\\\\u003c"\)/,'JSON-LD must escape <');
 }
 const g=read('components/listings/property-gallery.tsx');
 assert.equal((g.match(/photoAlt\(/g)||[]).length,2);
 assert.doesNotMatch(g,/alt=\{photos\[index\]\.label\|\|/);
 assert.match(read('app/layout.tsx'),/default:"산본중심상가 상가 임대·매매 \| 선부동산"/);
 assert.match(read('app/layout.tsx'),/"application\/rss\+xml"/);
 assert.ok(existsSync(join(root,'app/rss.xml/route.ts')));
 const repo=read('lib/content/repository.ts');
 assert.match(repo,/void notifySearchEngines\(\);/);
 assert.match(repo,/void notifySearchEngines\(\[id\]\);/);
 assert.match(read('app/api/content/indexnow/route.ts'),/lineestate_admins/,'IndexNow route must be admin only');
 assert.match(read('scripts/admin-content.mjs'),/indexNowBody\(site,INDEXNOW_KEY,paths\)/);
 assert.match(read('components/listings/listings-view.tsx'),/<a key=\{n\} href=\{href\(n\)\}/);
});
