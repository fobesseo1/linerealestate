import type {Metadata} from "next";
import {BudgetCompare} from "@/components/site/budget-compare";
import {Breadcrumb,ContactButton,EditorialHeading} from "@/components/site/editorial";

export const metadata:Metadata={title:"점포 비용 비교",description:"같은 예산으로 두 점포의 초기 비용을 비교해 보는 가상 예시입니다."};

export default function Page(){
 return <div className="page min-h-[65vh] pb-18 pt-10">
  <Breadcrumb>점포 비용 비교</Breadcrumb>
  <EditorialHeading eyebrow="COMPARE BEFORE YOU DECIDE" title={<>같은 예산, 다른 선택.<br/>오픈까지 드는 비용을 비교하세요.</>}>소형 카페와 넓은 카페를 비교하는 가상 예시입니다.</EditorialHeading>
  <BudgetCompare/>
  <p className="mb-6 mt-3 text-caption leading-[1.7] text-gray-500">초기 합계는 보증금·권리금·공사·장비·운영자금 합계입니다. 월세·관리비·부가세·중개보수·기타 개업 비용은 미포함입니다. 모든 수치는 가정입니다.</p>
  <ContactButton>내 조건으로 비교 상담 준비</ContactButton>
 </div>;
}
