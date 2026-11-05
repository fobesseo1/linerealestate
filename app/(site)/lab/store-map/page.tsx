import {LabHeader, ListingPicker, SourceNote} from "@/components/lab/lab-ui";
import {StoreMapView} from "@/components/lab/store-map-view";
import {guessCategory, labListings, param} from "@/lib/lab/listings";
import {formatBaseMonth, gunpoStores, within} from "@/lib/lab/store-data";

export const metadata = {title: "경쟁 점포 지도"};

export default async function Page({searchParams}: PageProps<"/lab/store-map">) {
  const params = await searchParams;
  const [listings, data] = await Promise.all([labListings(), gunpoStores()]);
  const listing = listings.find(l => l.number === param(params, "listing")) ?? listings[0];
  const radius = param(params, "radius") === "500" ? 500 : 300;
  const stores = within(data.items, listing, radius);
  return <>
    <LabHeader no={2} title="지도 위 경쟁 점포 핀">업종 버튼을 누르면 매물 주변의 해당 업종 점포가 지도에 핀으로 표시됩니다. 여러 업종을 함께 켤 수 있고, 핀 색은 대분류(음식·소매·교육 등)를 뜻합니다.</LabHeader>
    <ListingPicker listings={listings} selected={listing.number} radius={radius}/>
    <StoreMapView key={`${listing.number}-${radius}`} center={{latitude: listing.latitude, longitude: listing.longitude, title: listing.title}} radius={radius} stores={stores} initial={guessCategory(listing.industry) ?? "I212"}/>
    <SourceNote baseMonth={formatBaseMonth(data.baseMonth)}> 핀 위치는 공단 자료의 건물 좌표라서 같은 건물 점포는 한 점에 겹쳐 보입니다.</SourceNote>
  </>;
}
