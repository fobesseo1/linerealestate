import {Bar, LabHeader, ListingPicker, Panel, SourceNote} from "@/components/lab/lab-ui";
import {NativeSelect} from "@/components/ui/native-select";
import {guessCategory, labListings, param} from "@/lib/lab/listings";
import {countBy, formatBaseMonth, gunpoStores, within} from "@/lib/lab/store-data";

export const metadata = {title: "주변 업종 현황"};

export default async function Page({searchParams}: PageProps<"/lab/nearby">) {
  const params = await searchParams;
  const [listings, data] = await Promise.all([labListings(), gunpoStores()]);
  const listing = listings.find(l => l.number === param(params, "listing")) ?? listings[0];
  const radius = param(params, "radius") === "500" ? 500 : 300;
  const categories = countBy(data.items, s => `${s.mc}|${s.mcn}`).map(c => ({code: c.name.split("|")[0], name: c.name.split("|")[1]})).sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const cat = param(params, "cat") ?? guessCategory(listing.industry) ?? "I212";
  const catName = categories.find(c => c.code === cat)?.name ?? cat;

  const near = within(data.items, listing, radius);
  const large = countBy(near, s => s.lcn);
  const middle = countBy(near, s => `${s.mc}|${s.mcn}`).slice(0, 15);
  const sameBy = (r: number) => within(data.items, listing, r).filter(s => s.mc === cat);
  const same = near.filter(s => s.mc === cat);
  const sameSmall = countBy(same, s => s.scn);

  return <>
    <LabHeader no={1} title="이 점포 주변 업종 현황">매물 좌표를 중심으로 반경 안에 등록된 점포를 업종별로 셉니다. 실제 서비스에서는 매물 상세 페이지의 지도 아래에 카드로 들어가는 형태를 가정했습니다.</LabHeader>
    <ListingPicker listings={listings} selected={listing.number} radius={radius} extra={
      <label className="grid w-52 gap-1 text-xs font-semibold text-gray-900">비교할 업종 (중분류)
        <NativeSelect name="cat" defaultValue={cat}>{categories.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</NativeSelect>
      </label>}/>

    <section className="mb-6 border-b-4 border-brand bg-ink p-6 text-white max-sm:p-5">
      <p className="text-xs text-gray-400">{listing.number} · {listing.address}</p>
      <h2 className="mt-1 text-xl font-bold">반경 {radius}m 안 등록 점포 <span className="text-brand-soft">{near.length.toLocaleString()}곳</span></h2>
      <div className="mt-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
        {[300, 500, 1000].map(r => <div key={r} className="border border-ink-line bg-ink-raised p-4">
          <span className="text-caption text-gray-400">반경 {r}m · {catName}</span>
          <strong className="mt-1 block text-2xl">{sameBy(r).length.toLocaleString()}곳</strong>
        </div>)}
      </div>
      <p className="mt-4 text-body text-gray-400">같은 업종({catName}) 경쟁 점포는 반경 {radius}m 안에 <strong className="text-white">{same.length}곳</strong>입니다.</p>
    </section>

    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Panel title="대분류별 점포 수">{large.map(r => <Bar key={r.name} label={r.name} value={r.count} max={large[0]?.count ?? 0}/>)}</Panel>
      <Panel title="많은 업종 TOP 15 (중분류)">{middle.map(r => { const [code, name] = r.name.split("|"); return <Bar key={code} label={name} value={r.count} max={middle[0]?.count ?? 0} strong={code === cat}/>; })}</Panel>
      <Panel title={`${catName} 세부 업종`}>{sameSmall.length ? sameSmall.map(r => <Bar key={r.name} label={r.name} value={r.count} max={sameSmall[0].count} strong/>) : <p className="text-body text-gray-800">반경 안에 해당 업종 점포가 없습니다.</p>}</Panel>
      <Panel title={`${catName} 점포 목록 (가까운 순 20곳)`}>
        <ul className="divide-y divide-gray-100 text-body">
          {same.map(s => ({s, d: Math.round(Math.hypot((s.lat - listing.latitude) * 111000, (s.lon - listing.longitude) * 88300))})).sort((a, b) => a.d - b.d).slice(0, 20).map(({s, d}) =>
            <li key={s.id} className="flex justify-between gap-3 py-2"><span className="truncate">{s.name}{s.branch && ` ${s.branch}`} <span className="text-gray-700">· {s.scn}{s.floor && ` · ${s.floor}층`}</span></span><span className="shrink-0 tabular-nums text-gray-800">{d}m</span></li>)}
        </ul>
      </Panel>
    </div>
    <SourceNote baseMonth={formatBaseMonth(data.baseMonth)}> 반경은 매물 좌표에서 직선거리로 계산했습니다.</SourceNote>
  </>;
}
