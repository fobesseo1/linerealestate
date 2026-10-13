"use client";
import Link from "next/link";
import {useState,type ReactNode} from "react";
import {ArrowLeft,Phone} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card,CardTitle} from "@/components/ui/card";
import {InquiryForm,type InquiryContext} from "@/components/inquiry/inquiry-form";
import {usePageInquiry} from "@/components/site/site-context";
import {kindLabel,type Publication} from "@/lib/content/types";
import {amount,pyeong} from "@/lib/content/format";
import {site} from "@/lib/site";
import {PropertyGallery} from "./property-gallery";
import {PhotoPlaceholder} from "./listing-card";
import {NaverMap} from "./naver-map";

/** Listing or completed-case page. Facts come straight from the published record; blanks read 미확인. */
export function PropertyDetail({item}:{item:Publication}){
 const c=item.content,work=c.kind==="work";
 const inquiry:InquiryContext={kind:work?"work":"listing",title:c.title,reference:item.number,goal:c.kind==="sale"?"상가 매수 검토":work?"중개 사례 관련 상담":"상가 임대차 후보 비교"};
 usePageInquiry(inquiry);
 const [inquiryOpen,setInquiryOpen]=useState(false);
 const status=work?"실제 중개 완료 사례 · 현재 모집 아님":item.status==="completed"?"거래 완료":kindLabel[c.kind];
 const facts:[string,string][]=[
  ["거래 유형",kindLabel[c.kind]],
  ...(c.kind==="sale"?[["매매가",amount(c.salePrice)] as [string,string]]:[["보증금",amount(c.deposit)],["월세",amount(c.rent)]] as [string,string][]),
  ["전용면적",c.area?`${c.area}㎡ · 약 ${pyeong(c.area)}평`:"미확인"],
  ["층",c.floor||"미확인"],["권리금",amount(c.premium)],["관리비",amount(c.management)],["부가세",c.vat||"미확인"],
  ["입주 가능일",c.available||"미확인"],["주차",c.parking||"미확인"],["건축물 용도",c.usage||"미확인"],["사용승인일",c.approvedDate||"미확인"],
 ];
 const story:[string,string][]=work?[["고객의 출발점",c.initial],["해결할 문제",c.issue],["협의하고 도운 일",c.actions],["결과·이후 관계",c.outcome]]:[];
 return <div className="page pb-15 pt-8">
  <nav aria-label="현재 위치" className="my-6 flex items-center gap-2 text-xs text-gray-700"><Link href="/">홈</Link> / {kindLabel[c.kind]} / {item.number}</nav>
  <div className="mb-9 mt-7 flex items-center justify-between border-b-4 border-brand pb-8 pt-6 max-md:items-start max-md:gap-4">
   <div>
    <div className="mb-3 flex items-center gap-3 text-tiny text-gray-500"><Badge className="font-medium">{status}</Badge><span>{item.number}</span></div>
    <h1 className="mb-3 text-[clamp(28px,3.1vw,44px)] font-heavy leading-[1.3] tracking-[-0.045em]">{c.title}</h1>
    <p className="flex items-center gap-1 text-sm text-gray-600">{c.showMap?c.address:"군포·산본 · 상세 위치 상담"}</p>
   </div>
  </div>
  <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-10 max-lg:grid-cols-[minmax(0,1fr)_280px] max-lg:gap-6 max-md:grid-cols-1 max-md:gap-0">
   <div className="min-w-0">
    {c.photos.length>0?<PropertyGallery key={item.number} photos={c.photos} title={c.title}/>:<PhotoPlaceholder className="mt-6 rounded-lg"/>}
    <Section title={work?"거래 당시 점포 조건":"거래·점포 정보"}>
     <dl className="grid grid-cols-2 border-t border-gray-200 max-lg:grid-cols-1">
      {facts.map(([label,value])=><div key={label} className="flex gap-3 border-b border-gray-200 px-2 py-4"><dt className="basis-21 shrink-0 text-xs text-gray-700">{label}</dt><dd className="text-md font-demibold text-gray-800 [overflow-wrap:anywhere]">{value}</dd></div>)}
     </dl>
    </Section>
    <Section title={work?"중개 경험":"점포 소개"}>
     <Prose>{c.description}</Prose>
     {work&&<p className="mt-3 text-caption leading-[1.7] text-gray-500">현재 모집 중인 매물이 아닙니다. 임대 조건과 경험은 거래 당시 자료입니다.</p>}
    </Section>
    {story.map(([heading,body])=>body&&<Section key={heading} title={heading}><Prose>{body}</Prose></Section>)}
    {c.facilities.length>0&&<Section title="확인된 시설"><div className="flex flex-wrap gap-1">{c.facilities.map(f=><Badge key={f} variant="tag">{f}</Badge>)}</div></Section>}
    {c.showMap&&c.address&&<NaverMap address={c.address} title={c.title} caption={work?"실제 중개 완료 사례":item.status==="completed"?"거래 완료":kindLabel[c.kind]} positionOverride={c.latitude&&c.longitude?{latitude:c.latitude,longitude:c.longitude}:undefined}/>}
    <Link href={work?"/works":"/listings"} className="mt-7 inline-flex items-center gap-2 py-5 text-xs font-bold text-brand"><ArrowLeft size={16}/>목록으로</Link>
   </div>
   <aside className="sticky top-21 mt-8 max-h-[calc(100dvh-100px)] min-w-0 self-start overflow-y-auto overscroll-contain [scrollbar-width:thin] max-md:static max-md:mt-0 max-md:max-h-none max-md:overflow-visible max-md:pt-8">
    <div className="border-t-4 border-brand bg-ink p-6 text-white">
     <AgentHeading/>
     <a href={site.mobileHref} className="mb-1 mt-5 block text-[27px] font-bold tracking-[-0.03em]">{site.mobile}</a>
     <p className="mb-4 text-caption leading-[1.7] text-gray-400">{item.number}을 말씀해 주세요. 확인 후 최대한 빨리 안내드립니다.</p>
     <Button asChild variant="brand" className="h-12 w-full text-xs"><a href={site.mobileHref}><Phone size={16}/>전화하기</a></Button>
     <Button variant="brand" className="mt-3 h-12 w-full text-xs" onClick={()=>setInquiryOpen(!inquiryOpen)}>{inquiryOpen?"문의창 닫기":"메시지 남기기"}</Button>
     {inquiryOpen&&<InquiryForm variant="sidebar" context={inquiry}/>}
    </div>
    <Card className="p-6">
     <h3 className="mb-2 text-xs font-semibold">정보 확인 안내</h3>
     <p className="text-caption leading-[1.8] text-gray-500">미입력 항목은 미확인으로 표시합니다. 거래 조건과 시설은 상담·현장 확인 시 함께 살펴봅니다.</p>
    </Card>
   </aside>
  </div>
 </div>;
}

function Section({title,children}:{title:string;children:ReactNode}){
 return <Card className="mt-6 p-7 max-md:p-5"><CardTitle>{title}</CardTitle>{children}</Card>;
}

const Prose=({children}:{children:ReactNode})=><p className="whitespace-pre-wrap text-md leading-[1.95] text-gray-800 [overflow-wrap:anywhere]">{children}</p>;

function AgentHeading(){
 return <div className="flex items-center gap-3">
  <span className="grid size-10 place-items-center rounded-full bg-brand-tint text-xl font-bold text-brand">선</span>
  <div><small className="mb-1.5 block text-micro text-gray-400">산본 상가를 가장 가까이에서</small><strong className="text-lead">김영선 <span className="mt-1 block text-micro font-normal text-gray-400">공인중개사</span></strong></div>
 </div>;
}
