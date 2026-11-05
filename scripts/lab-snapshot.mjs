// Refreshes the 군포시 상가(상권)정보 snapshot used by the /lab test pages.
// Usage: node scripts/lab-snapshot.mjs   (needs PUBLICDATA_API_KEY in .env.local)
// The source data is public and changes once per quarter, so the site reads this
// committed snapshot instead of calling the rate-limited API on every cold start.
import {readFileSync, writeFileSync, mkdirSync, existsSync} from "node:fs";

const SIGNGU = "41410";
const OUT = "lib/lab/data/gunpo-snapshot.json";
const key = process.env.PUBLICDATA_API_KEY || readFileSync(".env.local", "utf8").match(/^PUBLICDATA_API_KEY=(.*)$/m)?.[1].trim();
if (!key) throw Error("PUBLICDATA_API_KEY가 없습니다.");

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function call(operation, params) {
  const query = new URLSearchParams({serviceKey: key, type: "json", ...params});
  for (let attempt = 1; attempt <= 5; attempt++) {
    await sleep(1300 * attempt);
    const response = await fetch(`https://apis.data.go.kr/B553077/api/open/sdsc2/${operation}?${query}`);
    if (response.status === 429) continue;
    const json = await response.json();
    if (!["00", "03"].includes(json.header?.resultCode)) throw Error(`${operation}: ${json.header?.resultMsg}`);
    return json;
  }
  throw Error(`${operation}: 429가 계속됩니다.`);
}

const t = v => String(v ?? "").trim();
const categories = {};
const rows = [];
let baseMonth = "";
for (let page = 1; ; page++) {
  const json = await call("storeListInDong", {divId: "signguCd", key: SIGNGU, numOfRows: "1000", pageNo: String(page)});
  baseMonth ||= json.header.stdrYm;
  const items = json.body?.items ?? [];
  for (const s of items) {
    categories[t(s.indsLclsCd)] = t(s.indsLclsNm);
    categories[t(s.indsMclsCd)] = t(s.indsMclsNm);
    categories[t(s.indsSclsCd)] = t(s.indsSclsNm);
    // [상가업소번호, 상호, 지점, 소분류코드, 행정동, 지번주소, 도로명주소, 건물명, 층, 위도, 경도]
    rows.push([t(s.bizesId), t(s.bizesNm), t(s.brchNm), t(s.indsSclsCd), t(s.adongNm), t(s.lnoAdr), t(s.rdnmAdr), t(s.bldNm), t(s.flrNo), Number(s.lat), Number(s.lon)]);
  }
  console.log(`page ${page}: ${rows.length}/${json.body?.totalCount}`);
  if (!items.length || rows.length >= json.body.totalCount) break;
}
const zoneJson = await call("storeZoneInAdmi", {divId: "signguCd", key: SIGNGU});
const zones = (zoneJson.body?.items ?? []).map(z => ({
  no: t(z.trarNo), name: t(z.mainTrarNm), area: Number(z.trarArea),
  ring: [...String(z.coords).matchAll(/(-?\d+\.\d+) (-?\d+\.\d+)/g)].map(m => [Number(m[1]), Number(m[2])]),
}));

if (!existsSync("lib/lab/data")) mkdirSync("lib/lab/data", {recursive: true});
writeFileSync(OUT, JSON.stringify({baseMonth, fetchedAt: new Date().toISOString(), categories, rows, zones}));
console.log(`saved ${OUT}: ${rows.length} stores, ${zones.length} zones, base ${baseMonth}`);
