import type {Metadata} from "next";
import {ClipboardList} from "lucide-react";
import {ContactButton,EditorialHeading} from "@/components/site/editorial";

export const metadata:Metadata={title:"상담·계약 과정",description:"처음 상담부터 후보 검토, 조건 협의와 입점까지 함께 살펴보는 과정입니다."};

const steps=[
 ["조건 정리","업종, 초기 예산, 월 부담과 필요한 시설을 함께 정합니다.","조건 정리표"],
 ["후보 비교","비용·동선·시설을 같은 기준으로 놓고 장점과 제약을 비교합니다.","후보 비교표"],
 ["현장 확인","시설 상태와 시간대별 동선을 현장과 자료로 확인합니다.","현장 확인 목록"],
 ["협의와 입점","공사 일정, 시설 인수, 비용 부담을 조율하고 입점까지 살핍니다.","협의 사항 정리표"],
];

export default function Page(){
 return <div className="page min-h-[65vh] pb-18 pt-10">
  <EditorialHeading eyebrow="HOW WE WORK" title={<>연락한 다음에는,<br/>이렇게 함께 살펴봅니다.</>}>처음 상담부터 후보 검토, 조건 협의와 입점까지.</EditorialHeading>
  <ol className="border-t border-t-ink">
   {steps.map(([title,body,output],i)=><li key={title} className="my-4 flex items-center gap-8 border border-gray-200 bg-white p-6 max-md:flex-wrap max-md:gap-4 max-md:p-5">
    <span className="text-[31px] font-heavy text-brand">0{i+1}</span>
    <div className="flex-1 max-md:basis-3/4"><h2 className="mb-2 text-[21px] font-demibold max-md:text-[19px]">{title}</h2><p className="text-body leading-[1.8] text-gray-600 max-md:text-xs">{body}</p></div>
    <strong className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-xs font-medium max-md:ml-12 max-md:text-caption"><ClipboardList size={17}/>{output}</strong>
   </li>)}
  </ol>
  <div className="mb-10 mt-8 flex items-center gap-6 bg-brand p-8 text-white max-md:flex-wrap max-md:gap-3">
   <div className="flex-1 max-md:basis-full"><h3 className="my-1 text-base font-demibold max-md:text-md max-md:leading-[1.6]">지금 조건이 정리되지 않았어도 괜찮습니다.</h3><p className="mt-1 text-caption text-white/70">희망 업종과 예산부터 이야기해 주세요.</p></div>
   <ContactButton className="bg-white text-brand hover:bg-white/90">상담 준비하기</ContactButton>
  </div>
 </div>;
}
