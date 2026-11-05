// Test-only (lab) access to the SEMAS 상가(상권)정보 OpenAPI.
// Server-side only: the key comes from PUBLICDATA_API_KEY and never reaches the browser.
// Results are cached as files under the ignored .tmp/lab-cache folder because the
// source data changes only once per quarter and the API rejects rapid calls (HTTP 429).
import {mkdir, readFile, writeFile} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const BASE = "https://apis.data.go.kr/B553077/api/open/sdsc2/";
// Vercel functions can only write to the system temp folder; locally keep the ignored .tmp folder.
export const CACHE_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "lab-cache") : path.join(process.cwd(), ".tmp", "lab-cache");
const memory = new Map<string, Dataset<unknown>>();
const CACHE_DAYS = 7;
const GAP_MS = 1300;

/** 군포시 시군구 코드. Every current listing sits inside it. */
export const GUNPO = "41410";
/** 산본역 3번 출구 부근: default centre when no listing is chosen. */
export const SANBON_CENTER = {latitude: 37.3596, longitude: 126.9315};

/** Compact store row kept from the API response. */
export type Store = {
  id: string; name: string; branch: string;
  lc: string; lcn: string; mc: string; mcn: string; sc: string; scn: string;
  dong: string; jibun: string; road: string; building: string; floor: string;
  lat: number; lon: number;
};
export type Zone = {no: string; name: string; area: number; ring: [number, number][]};
export type Dataset<T> = {items: T[]; baseMonth: string; fetchedAt: string};

let queue: Promise<unknown> = Promise.resolve();
let lastCall = 0;

/** Calls the API one request at a time with a gap, retrying on 429. */
function call(operation: string, params: Record<string, string>) {
  const run = async () => {
    const key = process.env.PUBLICDATA_API_KEY?.trim();
    if (!key) throw Error("PUBLICDATA_API_KEY가 .env.local에 없습니다.");
    const query = new URLSearchParams({serviceKey: key, type: "json", ...params});
    for (let attempt = 0; attempt < 5; attempt++) {
      const wait = lastCall + GAP_MS * (attempt + 1) - Date.now();
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      lastCall = Date.now();
      const response = await fetch(`${BASE}${operation}?${query}`, {cache: "no-store"});
      if (response.status === 429) continue;
      const text = await response.text();
      let json: {header?: {resultCode?: string; resultMsg?: string; stdrYm?: string}; body?: {items?: unknown[]; totalCount?: number}};
      try { json = JSON.parse(text); } catch { throw Error(`상가 API 응답을 읽지 못했습니다 (${operation}, HTTP ${response.status}).`); }
      // resultCode 03 means "no data", which is a valid empty answer.
      if (json.header?.resultCode && !["00", "03"].includes(json.header.resultCode)) throw Error(`상가 API 오류: ${json.header.resultMsg}`);
      return json;
    }
    throw Error("상가 API 호출이 계속 거절되었습니다(429). 잠시 후 다시 열어 주세요.");
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

async function cached<T>(name: string, load: () => Promise<Dataset<T>>): Promise<Dataset<T>> {
  const fresh = (d?: Dataset<unknown>) => d && Date.now() - Date.parse(d.fetchedAt) < CACHE_DAYS * 864e5;
  const inMemory = memory.get(name);
  if (fresh(inMemory)) return inMemory as Dataset<T>;
  const file = path.join(CACHE_DIR, `${name}.json`);
  try {
    const saved = JSON.parse(await readFile(file, "utf8")) as Dataset<T>;
    if (fresh(saved)) { memory.set(name, saved); return saved; }
  } catch { /* No usable cache yet. */ }
  const loaded = await load();
  memory.set(name, loaded);
  try {
    await mkdir(CACHE_DIR, {recursive: true});
    await writeFile(file, JSON.stringify(loaded));
    // Keep one dated copy per base month so quarterly trends can be compared later.
    if (loaded.baseMonth) await writeFile(path.join(CACHE_DIR, `${name}.${loaded.baseMonth}.json`), JSON.stringify(loaded));
  } catch (error) { console.warn("lab cache write skipped", error); }
  return loaded;
}

type RawStore = Record<string, string | number>;
const text = (v: unknown) => String(v ?? "").trim();
const toStore = (r: RawStore): Store => ({
  id: String(r.bizesId), name: text(r.bizesNm), branch: text(r.brchNm),
  lc: text(r.indsLclsCd), lcn: text(r.indsLclsNm), mc: text(r.indsMclsCd), mcn: text(r.indsMclsNm),
  sc: text(r.indsSclsCd), scn: text(r.indsSclsNm), dong: text(r.adongNm),
  jibun: text(r.lnoAdr), road: text(r.rdnmAdr), building: text(r.bldNm), floor: text(r.flrNo),
  lat: Number(r.lat), lon: Number(r.lon),
});

/** Every store registered in 군포시 (about 10,000 rows, 10 API pages on a cold cache). */
export function gunpoStores() {
  return cached<Store>(`stores-${GUNPO}`, async () => {
    const items: Store[] = [];
    let baseMonth = "";
    for (let page = 1; ; page++) {
      const json = await call("storeListInDong", {divId: "signguCd", key: GUNPO, numOfRows: "1000", pageNo: String(page)});
      baseMonth ||= json.header?.stdrYm ?? "";
      const rows = (json.body?.items ?? []) as RawStore[];
      items.push(...rows.map(toStore));
      if (!rows.length || items.length >= (json.body?.totalCount ?? 0)) break;
    }
    return {items, baseMonth, fetchedAt: new Date().toISOString()};
  });
}

/** 발달상권 boundaries inside 군포시. */
export function gunpoZones() {
  return cached<Zone>(`zones-${GUNPO}`, async () => {
    const json = await call("storeZoneInAdmi", {divId: "signguCd", key: GUNPO});
    const items = ((json.body?.items ?? []) as RawStore[]).map(z => ({
      no: String(z.trarNo), name: String(z.mainTrarNm), area: Number(z.trarArea),
      ring: [...String(z.coords).matchAll(/(-?\d+\.\d+) (-?\d+\.\d+)/g)].map(m => [Number(m[1]), Number(m[2])] as [number, number]),
    }));
    return {items, baseMonth: "", fetchedAt: new Date().toISOString()};
  });
}

/** Metres between two points (haversine). */
export function distance(a: {latitude: number; longitude: number}, lat: number, lon: number) {
  const rad = Math.PI / 180, R = 6371000;
  const dLat = (lat - a.latitude) * rad, dLon = (lon - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function within(stores: Store[], centre: {latitude: number; longitude: number}, radius: number) {
  return stores.filter(s => distance(centre, s.lat, s.lon) <= radius);
}

/** Ray-casting point-in-polygon test with [lon, lat] rings. */
export function insideZone(zone: Zone, latitude: number, longitude: number) {
  let inside = false;
  for (let i = 0, j = zone.ring.length - 1; i < zone.ring.length; j = i++) {
    const [xi, yi] = zone.ring[i], [xj, yj] = zone.ring[j];
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Counts rows by a key and returns them largest first. */
export function countBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, number>();
  for (const row of rows) map.set(key(row), (map.get(key(row)) ?? 0) + 1);
  return [...map].map(([name, count]) => ({name, count})).sort((a, b) => b.count - a.count);
}

export const formatBaseMonth = (ym: string) => (/^\d{6}$/.test(ym) ? `${ym.slice(0, 4)}년 ${Number(ym.slice(4))}월` : "확인 중");
