import {readdir} from "node:fs/promises";
import {Bar, LabHeader, Panel, SourceNote} from "@/components/lab/lab-ui";
import {Button} from "@/components/ui/button";
import {NativeSelect} from "@/components/ui/native-select";
import {param} from "@/lib/lab/listings";
import {CACHE_DIR, countBy, formatBaseMonth, gunpoStores, gunpoZones, insideZone, type Store} from "@/lib/lab/store-data";

export const metadata = {title: "산본 상권 한눈에"};

export default async function Page({searchParams}: PageProps<"/lab/overview">) {
  const params = await searchParams;
  const [data, zones] = await Promise.all([gunpoStores(), gunpoZones()]);
  const dongs = countBy(data.items, s => s.dong);
  const area = param(params, "area") ?? "zone:10636";
  let rows: Store[] = data.items, areaName = "군포시 전체";
  if (area.startsWith("dong:")) { areaName = area.slice(5); rows = data.items.filter(s => s.dong === areaName); }
  if (area.startsWith("zone:")) {
    const zone = zones.items.find(z => z.no === area.slice(5));
    if (zone) { areaName = `${zone.name} 상권`; rows = data.items.filter(s => insideZone(zone, s.lat, s.lon)); }
  }
  const large = countBy(rows, s => s.lcn);
  const middle = countBy(rows, s => s.mcn).slice(0, 10);
  const small = countBy(rows, s => s.scn).slice(0, 10);
  const snapshots = (await readdir(CACHE_DIR).catch(() => [] as string[]))
    .map(f => f.match(/^stores-\d+\.(\d{6})\.json$/)?.[1]).filter(Boolean) as string[];

  return <>
    <LabHeader no={6} title="산본 상권 한눈에">홈이나 별도 &lsquo;산본 상권 정보&rsquo; 페이지에 넣는 지역 콘텐츠를 가정했습니다. 지역을 고르면 업종 구성과 많은 업종 TOP 10이 바뀝니다.</LabHeader>
    <form className="mb-6 flex flex-wrap items-end gap-3 border border-gray-200 bg-white p-4">
      <label className="grid min-w-0 flex-[1_1_280px] gap-1 text-xs font-semibold text-gray-900">지역
        <NativeSelect name="area" defaultValue={area}>
          <option value="all">군포시 전체</option>
          <optgroup label="발달상권 (공단 기준)">{zones.items.map(z => <option key={z.no} value={`zone:${z.no}`}>{z.name} 상권</option>)}</optgroup>
          <optgroup label="행정동">{dongs.map(d => <option key={d.name} value={`dong:${d.name}`}>{d.name}</option>)}</optgroup>
        </NativeSelect>
      </label>
      <Button type="submit" className="h-11">보기</Button>
    </form>

    <section className="mb-6 grid grid-cols-3 gap-3 border-b-4 border-brand bg-ink p-6 text-white max-md:grid-cols-1 max-sm:p-5">
      <div><span className="text-caption text-gray-400">{areaName} 등록 점포</span><strong className="mt-1 block text-2xl">{rows.length.toLocaleString()}곳</strong></div>
      <div><span className="text-caption text-gray-400">가장 많은 업종</span><strong className="mt-1 block text-2xl">{small[0]?.name ?? "-"}</strong></div>
      <div><span className="text-caption text-gray-400">음식점 비중</span><strong className="mt-1 block text-2xl">{rows.length ? Math.round(((large.find(l => l.name === "음식")?.count ?? 0) / rows.length) * 100) : 0}%</strong></div>
    </section>

    <Panel title="업종 구성 (대분류 비중)" className="mb-4">
      <div className="flex h-8 w-full overflow-hidden">
        {large.map((l, i) => <span key={l.name} title={`${l.name} ${l.count}곳`} className={["bg-brand", "bg-ink", "bg-gray-900", "bg-brand-soft", "bg-gray-500", "bg-gray-300", "bg-brand-pale", "bg-gray-700", "bg-gray-200", "bg-gray-100"][i]}
          // Segment width is the data share, so it is set inline.
          style={{width: `${(l.count / rows.length) * 100}%`}}/>)}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-gray-900">{large.map(l => <li key={l.name}>{l.name} {Math.round((l.count / rows.length) * 100)}%</li>)}</ul>
    </Panel>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <Panel title="많은 업종 TOP 10 (중분류)">{middle.map(r => <Bar key={r.name} label={r.name} value={r.count} max={middle[0].count}/>)}</Panel>
      <Panel title="많은 업종 TOP 10 (소분류)">{small.map(r => <Bar key={r.name} label={r.name} value={r.count} max={small[0].count}/>)}</Panel>
      <Panel title="군포시 행정동별 점포 수">{dongs.map(r => <Bar key={r.name} label={r.name} value={r.count} max={dongs[0].count} strong={areaName === r.name}/>)}</Panel>
      <Panel title="분기별 추이">
        <p className="text-body leading-[1.7] text-gray-800">공단 자료는 분기마다 갱신됩니다. 이 테스트는 받은 자료를 기준월별로 따로 저장해 두므로, 다음 갱신 뒤부터 &lsquo;지난 분기 대비 카페 +3곳&rsquo; 같은 추이를 보여 줄 수 있습니다.</p>
        <p className="mt-3 text-body">저장된 기준월: <strong>{snapshots.map(formatBaseMonth).join(", ") || "없음"}</strong></p>
      </Panel>
    </div>
    <SourceNote baseMonth={formatBaseMonth(data.baseMonth)}/>
  </>;
}
