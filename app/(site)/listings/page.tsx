import type {Metadata} from "next";
import {ListingsView,type ListingFilters} from "@/components/listings/listings-view";
import {getPublications} from "@/lib/content/public";

export const metadata:Metadata={title:"산본 상가 매물",description:"산본 상가 임대차·매매 매물을 사진과 조건으로 비교해 보세요."};

export default async function Page({searchParams}:PageProps<"/listings">){
 const params=await searchParams;
 const one=(key:string)=>{const value=params[key];return (Array.isArray(value)?value[0]:value)||undefined;};
 const type=one("type");
 const filters:ListingFilters={type:type==="lease"||type==="sale"?type:undefined,industry:one("industry"),rent:one("rent"),q:one("q"),saved:one("saved")==="1"};
 return <ListingsView key={JSON.stringify(filters)} initial={await getPublications()} filters={filters}/>;
}
