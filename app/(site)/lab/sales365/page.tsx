import {LabHeader, ListingPicker, Panel, SourceNote} from "@/components/lab/lab-ui";
import {Sbiz365Frame, Sbiz365Source, Sbiz365Steps} from "@/components/lab/sbiz365";
import {NativeSelect} from "@/components/ui/native-select";
import {guessCategory, labListings, param, pickSmall} from "@/lib/lab/listings";
import {sbiz365Hint, sbiz365Key} from "@/lib/lab/sbiz365";
import {countBy, formatBaseMonth, gunpoStores, within} from "@/lib/lab/store-data";

export const metadata = {title: "이 지역 매출 보기"};

export default async function Page({searchParams}: PageProps<"/lab/sales365">) {
  const params = await searchParams;
  const [listings, data] = await Promise.all([labListings(), gunpoStores()]);
  const listing = listings.find(l => l.number === param(params, "listing")) ?? listings[0];
  const categories = countBy(data.items, s => `${s.mc}|${s.mcn}`).map(c => ({code: c.name.split("|")[0], name: c.name.split("|")[1]})).sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const cat = param(params, "cat") ?? guessCategory(listing.industry) ?? "I212";
  const catName = categories.find(c => c.code === cat)?.name ?? cat;
  const hint = await sbiz365Hint(listing);
  const near = within(data.items, listing, 300);
  const same = near.filter(s => s.mc === cat);
  const top = countBy(same, s => s.scn).slice(0, 3);

  return <>
    <LabHeader no={4} title="이 지역 매출 보기 (소상공인365)">매출 금액은 우리가 계산하지 않고 소상공인365 간단분석 화면을 그대로 붙여 보여 줍니다. 365는 지역·업종을 미리 지정할 수 없어서, 이 매물에 맞는 선택값을 옆에 안내합니다. 실제 서비스에서는 매물 상세의 &lsquo;이 지역 매출 보기&rsquo; 버튼으로 들어가는 형태를 가정했습니다.</LabHeader>
    <ListingPicker listings={listings} selected={listing.number} extra={
      <label className="grid w-52 gap-1 text-xs font-semibold text-gray-900">관심 업종 (중분류)
        <NativeSelect name="cat" defaultValue={cat}>{categories.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</NativeSelect>
      </label>}/>
    <div className="grid grid-cols-[320px_1fr] gap-4 max-lg:grid-cols-1">
      <div className="grid min-w-0 content-start gap-4">
        <Panel title="365에서 이렇게 고르세요">
          <Sbiz365Steps dong={hint.dong} zone={hint.zone} category={pickSmall(listing.industry, countBy(same, s => s.scn).map(r => r.name)) ?? catName}/>
        </Panel>
        <Panel title="우리 자료로 본 주변 (업소 수)">
          <dl className="grid gap-3 text-body">
            <div><dt className="text-caption text-gray-800">매물</dt><dd className="font-semibold">{listing.number} · {listing.address}</dd></div>
            <div><dt className="text-caption text-gray-800">행정동 / 발달상권</dt><dd className="font-semibold">{hint.dong} / {hint.zone ?? "상권 밖"}</dd></div>
            <div><dt className="text-caption text-gray-800">반경 300m 전체 점포</dt><dd className="text-xl font-bold">{near.length.toLocaleString()}곳</dd></div>
            <div><dt className="text-caption text-gray-800">반경 300m {catName}</dt><dd className="text-xl font-bold text-brand">{same.length}곳</dd><dd className="text-caption text-gray-800">{top.map(t => `${t.name} ${t.count}`).join(" · ")}</dd></div>
          </dl>
          <p className="mt-3 text-caption leading-[1.7] text-gray-700">365의 &lsquo;선택업종 업소 수&rsquo;는 행정동·상권 전체 기준이라 위의 반경 숫자와 다를 수 있습니다.</p>
        </Panel>
      </div>
      <section className="min-w-0 border border-gray-200 bg-white p-3">
        <Sbiz365Frame certKey={sbiz365Key()} className="h-[80vh] min-h-150"/>
        <div className="mt-2"><Sbiz365Source/></div>
      </section>
    </div>
    <SourceNote baseMonth={formatBaseMonth(data.baseMonth)}> 왼쪽 업소 수만 우리 자료이고, 오른쪽 화면의 숫자는 모두 소상공인365 값입니다.</SourceNote>
  </>;
}
