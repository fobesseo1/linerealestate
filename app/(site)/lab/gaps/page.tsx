import {LabHeader, ListingPicker, Panel, SourceNote} from "@/components/lab/lab-ui";
import {labListings, param} from "@/lib/lab/listings";
import {countBy, formatBaseMonth, gunpoStores, within} from "@/lib/lab/store-data";

export const metadata = {title: "주변에 적은 업종"};

type Row = {name: string; city: number; near: number; expected: number; ratio: number};

export default async function Page({searchParams}: PageProps<"/lab/gaps">) {
  const params = await searchParams;
  const [listings, data] = await Promise.all([labListings(), gunpoStores()]);
  const listing = listings.find(l => l.number === param(params, "listing")) ?? listings[0];
  const radius = param(params, "radius") === "300" ? 300 : 500;
  const near = within(data.items, listing, radius);
  const nearCount = new Map(countBy(near, s => s.scn).map(r => [r.name, r.count]));

  // Expected count = this category's share of all 군포시 stores × stores inside the radius.
  // Office-type and car-related categories rarely fit a station-front shop unit, so they are left out.
  const SKIP = /자동차|엔지니어링|포장\/충전|건설|중개/;
  const shops = data.items.filter(s => !["M1", "N1", "L1"].includes(s.lc) && !SKIP.test(s.scn));
  const rows: Row[] = countBy(shops, s => s.scn).filter(r => r.count >= 20).map(r => {
    const expected = (r.count / data.items.length) * near.length; // share of all stores × stores in radius
    const n = nearCount.get(r.name) ?? 0;
    return {name: r.name, city: r.count, near: n, expected, ratio: n / expected};
  }).filter(r => r.expected >= 2);
  const fewer = [...rows].sort((a, b) => a.ratio - b.ratio).slice(0, 15);
  const more = [...rows].sort((a, b) => b.ratio - a.ratio).slice(0, 10);
  const per100 = (count: number, total: number) => ((count / total) * 100).toFixed(1);

  const Table = ({rows, tone}: {rows: Row[]; tone: "low" | "high"}) => <div className="overflow-x-auto">
    <table className="w-full min-w-120 text-body">
      <thead><tr className="border-b border-gray-200 text-left text-caption text-gray-800"><th className="py-2 font-semibold">업종 (소분류)</th><th className="py-2 text-right font-semibold">이 반경</th><th className="py-2 text-right font-semibold">군포시 비중이면</th><th className="py-2 text-right font-semibold">100곳 중 (반경 / 군포)</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.name} className="border-b border-gray-100">
        <td className="py-2 font-semibold">{r.name}</td>
        <td className={`py-2 text-right tabular-nums font-bold ${tone === "low" ? "text-brand" : "text-ink"}`}>{r.near}곳</td>
        <td className="py-2 text-right tabular-nums text-gray-800">약 {Math.round(r.expected)}곳</td>
        <td className="py-2 text-right tabular-nums text-gray-800">{per100(r.near, near.length)} / {per100(r.city, data.items.length)}</td>
      </tr>)}</tbody>
    </table>
  </div>;

  return <>
    <LabHeader no={3} title="주변에 적은 업종">군포시 전체 업종 비중과 비교해, 이 매물 반경 안에서 상대적으로 적거나 많은 업종을 숫자로 보여 줍니다. &ldquo;유망하다&rdquo;는 판단은 하지 않고 비교 숫자만 표시합니다.</LabHeader>
    <ListingPicker listings={listings} selected={listing.number} radius={radius} radii={[300, 500]}/>
    <p className="mb-4 text-sm text-gray-900">{listing.number} 반경 {radius}m 안 등록 점포 <strong>{near.length.toLocaleString()}곳</strong> · 군포시 전체 {data.items.length.toLocaleString()}곳</p>
    <div className="grid gap-4">
      <Panel title="군포시 비중보다 적은 업종">
        <p className="mb-3 text-caption text-gray-800">예: 군포시 전체에서 100곳 중 2곳이 이 업종이면, 이 반경 점포 수에 같은 비율을 곱한 값이 &lsquo;군포시 비중이면&rsquo;입니다. 군포시 20곳 이상 업종만 비교했고, 사무실형(전문·기술 서비스, 부동산, 시설관리)과 자동차 관련 업종은 뺐습니다.</p>
        <Table rows={fewer} tone="low"/>
      </Panel>
      <Panel title="군포시 비중보다 많은 업종 (밀집 업종)"><Table rows={more} tone="high"/></Panel>
    </div>
    <SourceNote baseMonth={formatBaseMonth(data.baseMonth)}> 역세권 중심상가는 주거지 업종(세탁·학원 등)이 원래 적게 나오는 경향이 있어, 숫자는 참고용입니다.</SourceNote>
  </>;
}
