import {LabHeader, SourceNote} from "@/components/lab/lab-ui";
import {ZoneMapView} from "@/components/lab/zone-map-view";
import {labListings} from "@/lib/lab/listings";
import {formatBaseMonth, gunpoStores, gunpoZones, insideZone} from "@/lib/lab/store-data";

export const metadata = {title: "상권 경계와 매물"};

const COLORS = ["#2563EB", "#059669", "#D97706", "#9333EA", "#0891B2", "#DB2777"];

export default async function Page() {
  const [listings, zoneData, stores] = await Promise.all([labListings(), gunpoZones(), gunpoStores()]);
  const zoneOf = (lat: number, lon: number) => zoneData.items.find(z => insideZone(z, lat, lon))?.name ?? "";
  const rows = listings.map(l => ({number: l.number, title: l.title, kindName: l.kindName, latitude: l.latitude, longitude: l.longitude, zone: zoneOf(l.latitude, l.longitude)}));
  const zones = zoneData.items.map((z, i) => ({
    no: z.no, name: z.name, ring: z.ring, color: COLORS[i % COLORS.length],
    listings: rows.filter(r => r.zone === z.name).length,
    stores: stores.items.filter(s => insideZone(z, s.lat, s.lon)).length,
  })).sort((a, b) => b.listings - a.listings);
  const inside = rows.filter(r => r.zone).length;

  return <>
    <LabHeader no={5} title="상권 경계와 매물">소상공인시장진흥공단이 정한 군포시 발달상권 {zones.length}곳의 경계를 지도에 그리고, 우리 매물·사례가 상권 안에 있는지 표시합니다. 실제 서비스에서는 매물 목록의 &lsquo;상권 안&rsquo; 필터나 매물 상세의 상권 이름 표시로 쓸 수 있습니다.</LabHeader>
    <p className="mb-4 text-sm text-gray-900">좌표가 있는 매물·사례 {rows.length}건 중 <strong>{inside}건</strong>이 발달상권 안에 있습니다.</p>
    <ZoneMapView zones={zones} listings={rows}/>
    <SourceNote baseMonth={formatBaseMonth(stores.baseMonth)}> 상권 경계: 공단 주요상권(storeZoneInAdmi). 경계 밖이라도 실제 유동 인구가 적다는 뜻은 아닙니다.</SourceNote>
  </>;
}
