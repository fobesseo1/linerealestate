"use client";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

// Illustrative assumptions only, as stated on the page; not a real listing.
const rows=[
 ["전용면적 / 층","13평 / 1층","18평 / 1층"],["보증금","2,000만원","3,000만원"],["월세 + 관리비","120만원","190만원"],
 ["권리금","없음으로 가정","800만원"],["공사 / 장비","2,000 / 600만원","2,400 / 700만원"],["예비 운영자금","400만원","400만원"],
 ["초기 예산 합계","5,000만원","7,300만원"],["운영 방향","테이크아웃 + 소수 좌석","좌석 운영 비중 높음"],["확인할 제약","좌석·창고, 실제 보행","고정비, 실제 고객 유입"],
];
const totals=[["A점포",5000],["B점포",7300]] as const;

export function BudgetCompare(){
 const [budget,setBudget]=useState(5000);
 return <>
  <div className="mb-6 flex items-center gap-4 rounded-lg border border-[#ddd] bg-white p-6 max-md:gap-3 max-md:p-4">
   <label htmlFor="budget" className="text-sm font-semibold max-md:text-xs">내 초기 예산</label>
   <Input id="budget" type="number" min="0" step="100" value={budget} onChange={event=>setBudget(Math.max(0,Number(event.target.value)))} className="w-35 px-4 py-2.5 text-[22px] font-demibold max-md:w-28 max-md:text-xl"/>
   <span className="text-gray-700">만원</span>
  </div>
  <div className="overflow-auto">
   <table className="w-full min-w-145 border-collapse border-t-2 border-t-[#222] bg-white text-left">
    <thead><tr>{["비교 항목","A · 생활동선형 소형","B · 전면형 중형"].map(label=><th key={label} className="border-b border-gray-200 bg-ink px-5 py-4 text-sm text-white max-md:px-4 max-md:py-3 max-md:text-xs">{label}</th>)}</tr></thead>
    <tbody>{rows.map(([label,a,b])=>{const total=label==="초기 예산 합계";return <tr key={label} className={cn(total&&"bg-[#fff6f8]")}>
     <th className="w-[30%] border-b border-gray-200 px-5 py-4 text-xs font-medium text-gray-700 max-md:px-4 max-md:py-3">{label}</th>
     {[a,b].map((value,i)=><td key={i} className={cn("border-b border-gray-200 px-5 py-4 text-body max-md:px-4 max-md:py-3 max-md:text-xs",total&&"font-demibold text-brand")}>{value}</td>)}
    </tr>;})}</tbody>
   </table>
  </div>
  <div className="mt-6 grid grid-cols-2 gap-5 max-md:gap-3">
   {totals.map(([label,cost])=><div key={label} className="rounded-lg border-t-4 border-brand bg-white p-6 max-md:p-4">
    <small className="text-caption text-gray-600">{label} · 입력 예산 대비</small>
    <strong className={cn("mt-1.5 block text-2xl font-demibold max-md:text-xl",budget<cost&&"text-brand")}>{Math.abs(budget-cost).toLocaleString("ko-KR")}만원 {budget>=cost?"여유":"부족"}</strong>
   </div>)}
  </div>
 </>;
}
