import Link from "next/link";
import {LabHeader, Panel, SourceNote} from "@/components/lab/lab-ui";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {param} from "@/lib/lab/listings";
import {countBy, formatBaseMonth, gunpoStores, gunpoZones, insideZone, within} from "@/lib/lab/store-data";

export const metadata = {title: "매물 등록 도우미"};

const squash = (s: string) => s.replace(/\s+/g, "").replace(/번지$/, "");
/** True when `address` contains `query` and the match is not followed by another digit or "-digit". */
function matches(address: string, query: string) {
  const a = squash(address), q = squash(query);
  const at = a.indexOf(q);
  return q.length >= 4 && at >= 0 && !/^[0-9-]/.test(a.slice(at + q.length));
}

export default async function Page({searchParams}: PageProps<"/lab/admin-helper">) {
  const params = await searchParams;
  const q = param(params, "q")?.trim() ?? "";
  const [data, zones] = await Promise.all([gunpoStores(), gunpoZones()]);
  const base = formatBaseMonth(data.baseMonth);
  const hits = q ? data.items.filter(s => matches(s.jibun, q) || matches(s.road, q)) : [];
  const centre = hits.length ? {latitude: hits.reduce((a, s) => a + s.lat, 0) / hits.length, longitude: hits.reduce((a, s) => a + s.lon, 0) / hits.length} : null;

  let draft = "", facts: [string, string][] = [];
  if (centre) {
    const first = hits[0];
    const zone = zones.items.find(z => insideZone(z, centre.latitude, centre.longitude));
    const near = within(data.items, centre, 300);
    const top = countBy(near, s => s.mcn).slice(0, 3);
    const inBuilding = countBy(hits, s => s.mcn).slice(0, 3);
    const floors = countBy(hits.filter(s => s.floor), s => s.floor).sort((a, b) => Number(a.name) - Number(b.name));
    const building = first.building || "건물명 미등록";
    facts = [
      ["행정동", first.dong], ["지번 주소", first.jibun], ["도로명 주소", first.road], ["건물명", building],
      ["발달상권", zone ? `${zone.name} 상권 안` : "발달상권 밖"], ["좌표", `${centre.latitude.toFixed(6)}, ${centre.longitude.toFixed(6)}`],
      ["이 주소 등록 점포", `${hits.length}곳`], ["층별 등록 점포", floors.map(f => `${f.name}층 ${f.count}`).join(" · ") || "층 정보 없음"],
      ["반경 300m 등록 점포", `${near.length.toLocaleString()}곳`],
    ];
    draft = [
      `${first.dong} ${first.building ? `${first.building} ` : ""}(${first.road || first.jibun})에 있는 상가입니다.`,
      zone ? `소상공인시장진흥공단이 정한 발달상권 '${zone.name}' 안에 위치합니다.` : "",
      `반경 300m 안에 등록 점포가 ${near.length.toLocaleString()}곳 있고, ${top.map(t => `${t.name}(${t.count}곳)`).join(", ")} 업종이 많습니다.`,
      hits.length > 1 ? `같은 건물에는 ${hits.length}곳이 등록되어 있으며 주로 ${inBuilding.map(t => t.name).join(", ")} 업종입니다.` : "",
      `(상가정보 ${base} 기준)`,
    ].filter(Boolean).join(" ");
  }

  return <>
    <LabHeader no={10} title="매물 등록 도우미">관리자가 새 매물을 등록할 때 주소만 넣으면 행정동·상권·주변 업종을 찾아 &lsquo;입지 설명&rsquo; 초안을 만들어 줍니다. 이 테스트는 아무것도 저장하지 않습니다. 실제로는 관리자 화면에서 초안을 보고 고친 뒤 저장하는 흐름을 가정했습니다.</LabHeader>
    <form className="mb-3 flex flex-wrap items-end gap-3 border border-gray-200 bg-white p-4">
      <label className="grid min-w-0 flex-[1_1_320px] gap-1 text-xs font-semibold text-gray-900">주소 (지번 또는 도로명)
        <Input name="q" defaultValue={q} placeholder="예: 산본동 1134-1 또는 산본로323번길 13" className="h-11"/>
      </label>
      <Button type="submit" className="h-11">찾기</Button>
    </form>
    <p className="mb-6 flex flex-wrap gap-2 text-caption text-gray-800">예시:
      {["산본동 1134-1", "산본로323번길 13", "산본동 1123-5", "광정로 80"].map(e => <Link key={e} href={`/lab/admin-helper?q=${encodeURIComponent(e)}`} className="text-brand underline-offset-4 hover:underline">{e}</Link>)}
    </p>
    {q && !centre && <p className="border border-gray-200 bg-white p-5 text-body">&lsquo;{q}&rsquo; 주소로 등록된 점포를 찾지 못했습니다. 공단 자료는 점포가 등록된 건물만 담고 있어 빈 건물·신축은 나오지 않을 수 있습니다. 실제 도구에서는 이때 네이버 주소 검색으로 좌표를 받아 같은 계산을 하면 됩니다.</p>}
    {centre && <div className="grid gap-4">
      <Panel title="자동으로 찾은 정보">
        <dl className="grid grid-cols-3 gap-px bg-gray-200 max-md:grid-cols-1">
          {facts.map(([k, v]) => <div key={k} className="bg-white p-3"><dt className="text-caption text-gray-800">{k}</dt><dd className="mt-1 text-body font-semibold">{v}</dd></div>)}
        </dl>
      </Panel>
      <Panel title="입지 설명 초안">
        <textarea readOnly defaultValue={draft} key={draft} rows={5} className="w-full border border-input bg-gray-50 p-3 text-sm leading-[1.8]"/>
        <p className="mt-2 text-caption text-gray-800">사실 숫자만 넣은 초안입니다. 유동인구·매출 같은 표현은 넣지 않았습니다. 저장 전에 직접 확인해 주세요.</p>
      </Panel>
    </div>}
    <SourceNote baseMonth={base}/>
  </>;
}
