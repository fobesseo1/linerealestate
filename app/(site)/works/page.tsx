import type {Metadata} from "next";
import {WorksView} from "@/components/listings/listings-view";
import {DealRecords} from "@/components/listings/deal-records";
import {getDealRecords,getPublications} from "@/lib/content/public";

export const metadata:Metadata={title:"중개 완료 사례",description:"김영선 공인중개사가 계약부터 오픈까지 함께한 산본 상가 중개 사례와 연도별 입점 기록입니다."};

export default async function Page(){
 const [publications,records]=await Promise.all([getPublications(),getDealRecords()]);
 return <>
  <WorksView initial={publications}/>
  <DealRecords records={records||[]}/>
 </>;
}
