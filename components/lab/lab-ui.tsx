import Link from "next/link";
import type {ReactNode} from "react";
import {FlaskConical} from "lucide-react";
import {Button} from "@/components/ui/button";
import {NativeSelect} from "@/components/ui/native-select";
import type {LabListing} from "@/lib/lab/listings";

export const LABS = [
  {slug: "nearby", no: 1, title: "이 점포 주변 업종 현황", text: "매물 반경 300m·500m 안 업종별 점포 수와 같은 업종 경쟁 점포 수"},
  {slug: "store-map", no: 2, title: "지도 위 경쟁 점포 핀", text: "업종을 고르면 주변 점포가 지도에 핀으로 표시"},
  {slug: "gaps", no: 3, title: "주변에 적은 업종", text: "군포시 전체 비중과 비교해 이 반경에 적은 업종을 숫자로 표시"},
  {slug: "sales365", no: 4, title: "이 지역 매출 보기 (소상공인365)", text: "매물 주변 점포 수 옆에 365 간단분석 화면을 붙이고 어떤 지역·업종을 고를지 안내"},
  {slug: "zones", no: 5, title: "상권 경계와 매물", text: "공단 발달상권 경계를 그리고 매물이 상권 안인지 표시"},
  {slug: "overview", no: 6, title: "산본 상권 한눈에", text: "군포시·행정동별 업종 TOP 10과 업종 비중"},
  {slug: "case-context", no: 9, title: "완료 사례의 주변 상권", text: "중개 완료 사례 주변의 같은 업종 점포 수"},
  {slug: "admin-helper", no: 10, title: "매물 등록 도우미", text: "주소를 넣으면 행정동·상권·주변 업종으로 입지 설명 초안 작성"},
] as const;

/** Header shared by every lab page. Lab pages are not linked from the public site. */
export function LabHeader({no, title, children}: {no: number; title: string; children: ReactNode}) {
  return <header className="mb-6 mt-8">
    <div className="mb-4 flex flex-wrap items-center gap-2 border border-brand bg-brand-tint px-4 py-3 text-xs text-ink">
      <FlaskConical size={16} aria-hidden className="text-brand"/>
      <strong>테스트 페이지</strong>
      <span className="text-gray-800">실제 사이트 메뉴에는 연결되어 있지 않습니다.</span>
      <Link href="/lab" className="ml-auto font-semibold text-brand underline-offset-4 hover:underline">테스트 목록</Link>
    </div>
    <span className="text-tiny font-demibold tracking-[.2em] text-brand">LAB {String(no).padStart(2, "0")}</span>
    <h1 className="mt-2 text-[clamp(28px,3.4vw,48px)] font-heavy leading-[1.3]">{title}</h1>
    <p className="mt-3 max-w-185 text-sm leading-[1.8] text-gray-800">{children}</p>
  </header>;
}

/** GET form for choosing a listing and radius; works without client JavaScript. */
export function ListingPicker({listings, selected, radius, radii = [300, 500], extra}: {listings: LabListing[]; selected?: string; radius?: number; radii?: number[]; extra?: ReactNode}) {
  return <form className="mb-6 flex flex-wrap items-end gap-3 border border-gray-200 bg-white p-4">
    <label className="grid min-w-0 flex-[1_1_320px] gap-1 text-xs font-semibold text-gray-900">매물·사례
      <NativeSelect name="listing" defaultValue={selected}>
        {listings.map(l => <option key={l.number} value={l.number}>{l.number} · {l.kindName} · {l.title}</option>)}
      </NativeSelect>
    </label>
    {radius !== undefined && <label className="grid w-32 gap-1 text-xs font-semibold text-gray-900">반경
      <NativeSelect name="radius" defaultValue={String(radius)}>{radii.map(r => <option key={r} value={r}>{r}m</option>)}</NativeSelect>
    </label>}
    {extra}
    <Button type="submit" className="h-11">보기</Button>
  </form>;
}

/** Horizontal bar row; widths are data-driven so they use an inline percentage. */
export function Bar({label, value, max, note, strong}: {label: string; value: number; max: number; note?: string; strong?: boolean}) {
  return <div className="grid grid-cols-[120px_1fr_64px] items-center gap-3 py-1 text-body max-sm:grid-cols-[96px_1fr_56px]">
    <span className={strong ? "truncate font-bold text-brand" : "truncate text-gray-900"}>{label}</span>
    <span className="h-3 bg-gray-100"><span className={`block h-full ${strong ? "bg-brand" : "bg-ink"}`} style={{width: `${max ? Math.max(2, (value / max) * 100) : 0}%`}}/></span>
    <span className="text-right tabular-nums text-gray-900">{value.toLocaleString()}{note ?? "곳"}</span>
  </div>;
}

export function SourceNote({baseMonth, children}: {baseMonth: string; children?: ReactNode}) {
  return <p className="mt-6 border-t border-gray-200 pt-4 text-caption leading-[1.7] text-gray-700">
    출처: 소상공인시장진흥공단 상가(상권)정보 (기준 {baseMonth}). 공단에 등록된 업소 기준이며 실제 영업 여부·폐업 반영 시차가 있을 수 있습니다.{children}
  </p>;
}

export function Panel({title, children, className}: {title: string; children: ReactNode; className?: string}) {
  return <section className={`min-w-0 border border-gray-200 bg-white p-5 max-sm:p-4 ${className ?? ""}`}>
    <h2 className="mb-4 text-lead font-bold">{title}</h2>
    {children}
  </section>;
}
