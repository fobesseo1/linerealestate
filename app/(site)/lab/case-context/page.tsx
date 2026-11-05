import {Check, X} from "lucide-react";
import {LabHeader, SourceNote} from "@/components/lab/lab-ui";
import {Sbiz365Button} from "@/components/lab/sbiz365";
import {sbiz365Hint, sbiz365Key} from "@/lib/lab/sbiz365";
import {guessCategory, labListings} from "@/lib/lab/listings";
import {distance, formatBaseMonth, gunpoStores, gunpoZones, insideZone, within} from "@/lib/lab/store-data";

export const metadata = {title: "완료 사례의 주변 상권"};

export default async function Page() {
  const [listings, data, zones] = await Promise.all([labListings(), gunpoStores(), gunpoZones()]);
  const cases = listings.filter(l => l.kind === "work");
  const base = formatBaseMonth(data.baseMonth);
  const hints = await Promise.all(cases.map(c => sbiz365Hint(c)));
  const certKey = sbiz365Key();

  return <>
    <LabHeader no={9} title="완료 사례의 주변 상권">중개 완료 사례마다 주변의 같은 업종 점포 수와 상권 위치를 붙여 봤습니다. 거래 사실이 아닌 공공 자료 숫자만 쓰므로 사례 내용을 지어낼 위험이 없습니다.</LabHeader>
    <p className="mb-6 border-l-4 border-brand bg-white p-4 text-body leading-[1.7] text-gray-900">지금 보이는 숫자는 <strong>{base} 기준</strong>입니다. &lsquo;계약 당시&rsquo; 숫자를 보여 주려면 앞으로 사례를 게시할 때 그 시점의 숫자를 함께 저장해야 합니다. 이미 게시된 사례는 과거 시점 자료가 없어 현재 기준으로만 표시할 수 있습니다.</p>
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      {cases.map((c, index) => {
        const cat = guessCategory(c.industry);
        const near = (r: number) => within(data.items, c, r);
        const same = cat ? near(300).filter(s => s.mc === cat) : [];
        const catName = same[0]?.mcn ?? data.items.find(s => s.mc === cat)?.mcn ?? "업종 미분류";
        const zone = zones.items.find(z => insideZone(z, c.latitude, c.longitude));
        const keyword = c.title.replace(/\s*산본점$/, "").split(" ")[0];
        const registered = data.items.find(s => s.name.includes(keyword) && distance(c, s.lat, s.lon) < 80);
        return <article key={c.number} className="border border-gray-200 bg-white">
          <div className="border-b-4 border-brand bg-ink p-5 text-white">
            <span className="text-caption text-gray-400">{c.number} · {c.industry}</span>
            <h2 className="mt-1 text-xl font-bold">{c.title}</h2>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-gray-200">
            {[
              ["상권", zone ? `${zone.name} 상권 안` : "발달상권 밖"],
              ["비교 업종", catName],
              ["반경 100m 같은 업종", cat ? `${near(100).filter(s => s.mc === cat).length}곳` : "-"],
              ["반경 300m 같은 업종", cat ? `${same.length}곳` : "-"],
              ["반경 300m 전체 점포", `${near(300).length.toLocaleString()}곳`],
              ["같은 건물 등록 점포", `${data.items.filter(s => distance(c, s.lat, s.lon) < 15).length}곳`],
            ].map(([k, v]) => <div key={k} className="bg-white p-4"><dt className="text-caption text-gray-800">{k}</dt><dd className="mt-1 text-lg font-bold">{v}</dd></div>)}
          </dl>
          <p className="flex items-center gap-2 p-4 text-body text-gray-900">
            {registered ? <><Check size={16} className="text-brand" aria-hidden/>공단 자료에 &lsquo;{registered.name}&rsquo;({registered.scn}{registered.floor && `, ${registered.floor}층`})으로 등록되어 있습니다.</>
              : <><X size={16} className="text-gray-700" aria-hidden/>공단 자료에서 상호로 찾지 못했습니다(미등록 또는 상호 다름).</>}
          </p>
          <div className="px-4 pb-4"><Sbiz365Button certKey={certKey} {...hints[index]} category={registered?.scn ?? catName} label="이 업종 지역 매출 (365)"/></div>
        </article>;
      })}
    </div>
    <SourceNote baseMonth={base}> 사례 업종은 사례 문구에서 자동으로 고른 비교 업종이라 실제 영업 업종과 다를 수 있습니다.</SourceNote>
  </>;
}
