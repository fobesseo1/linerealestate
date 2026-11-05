// Test-only (lab) access to 군포시 상가(상권)정보 from 소상공인시장진흥공단.
// The data is public and refreshed quarterly, so the site reads a committed snapshot
// (lib/lab/data/gunpo-snapshot.json, rebuilt with `node scripts/lab-snapshot.mjs`)
// instead of calling the rate-limited API on every server start.
import snapshot from "./data/gunpo-snapshot.json";

/** 군포시 시군구 코드. Every current listing sits inside it. */
export const GUNPO = "41410";

/** Store row used by the lab pages. */
export type Store = {
  id: string; name: string; branch: string;
  lc: string; lcn: string; mc: string; mcn: string; sc: string; scn: string;
  dong: string; jibun: string; road: string; building: string; floor: string;
  lat: number; lon: number;
};
export type Zone = {no: string; name: string; area: number; ring: [number, number][]};
export type Dataset<T> = {items: T[]; baseMonth: string; fetchedAt: string};

type Row = [string, string, string, string, string, string, string, string, string, number, number];
const names = snapshot.categories as Record<string, string>;
let stores: Dataset<Store> | undefined;

/** Every store registered in 군포시 (about 10,000 rows). */
export async function gunpoStores(): Promise<Dataset<Store>> {
  stores ??= {
    baseMonth: snapshot.baseMonth, fetchedAt: snapshot.fetchedAt,
    items: (snapshot.rows as Row[]).map(([id, name, branch, sc, dong, jibun, road, building, floor, lat, lon]) => {
      const lc = sc.slice(0, 2), mc = sc.slice(0, 4);
      return {id, name, branch, lc, lcn: names[lc] ?? lc, mc, mcn: names[mc] ?? mc, sc, scn: names[sc] ?? sc, dong, jibun, road, building, floor, lat, lon};
    }),
  };
  return stores;
}

/** 발달상권 boundaries inside 군포시. */
export async function gunpoZones(): Promise<Dataset<Zone>> {
  return {items: snapshot.zones as Zone[], baseMonth: snapshot.baseMonth, fetchedAt: snapshot.fetchedAt};
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
