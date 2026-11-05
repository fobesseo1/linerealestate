import {gunpoStores, gunpoZones, insideZone} from "./store-data";

/**
 * 소상공인365 간단분석 certKey. It must appear in the iframe address, so visitors can see it;
 * it is still kept in an environment variable rather than in source code.
 */
export function sbiz365Key() {
  return process.env.SBIZ365_SIMPLE_KEY?.trim() || undefined;
}

/** Region hints for the 365 screen: 행정동 of the nearest store and the 발달상권 name. */
export async function sbiz365Hint(point: {latitude: number; longitude: number}) {
  const [stores, zones] = await Promise.all([gunpoStores(), gunpoZones()]);
  let dong = "", best = Infinity;
  for (const s of stores.items) {
    const d = (s.lat - point.latitude) ** 2 + (s.lon - point.longitude) ** 2;
    if (d < best) { best = d; dong = s.dong; }
  }
  const zone = zones.items.find(z => insideZone(z, point.latitude, point.longitude))?.name;
  return {dong, zone};
}
