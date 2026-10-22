import Link from "next/link";
import {ArrowUpRight,MapPin} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {dealTypeLabel,type DealRecord} from "@/lib/content/types";

/** Yearly record of every brokered contract; detailed stories link to their case page. */
export function DealRecords({records}:{records:DealRecord[]}){
 if(!records.length)return null;
 const years=[...new Set(records.map(r=>r.contracted_month.slice(0,4)))];
 const first=years[years.length-1];
 const industries=Object.entries(records.reduce<Record<string,number>>((count,r)=>{if(r.industry)count[r.industry]=(count[r.industry]||0)+1;return count;},{})).sort((a,b)=>b[1]-a[1]);
 const types=[...new Set(records.map(r=>dealTypeLabel[r.deal_type]))].join("·");
 return <section id="records" className="page scroll-mt-22 pb-18 pt-4">
  <div className="mb-8 border-b-4 border-brand bg-ink p-10 text-white max-md:px-6 max-md:py-7">
   <span className="text-tiny font-demibold tracking-[.12em] text-brand">CONTRACTS SINCE {first}</span>
   <h2 className="my-3 text-[clamp(26px,3vw,40px)] font-heavy leading-[1.3]">{first}년부터, 산본 {records.length}곳의 입점을 함께했습니다.</h2>
   <p className="text-sm leading-[1.8] text-gray-400 max-md:text-body">김영선 공인중개사가 중개한 {types} 계약 기록입니다. 매장 이름을 누르면 네이버 지도에서 확인할 수 있습니다.</p>
   <div className="mt-6 flex flex-wrap gap-2">
    {industries.map(([industry,count])=><span key={industry} className="rounded-sm border border-ink-line bg-ink-raised px-3 py-1 text-xs text-white">{industry} <b className="text-brand-soft">{count}</b></span>)}
   </div>
  </div>
  <div className="grid gap-8">
   {years.map(year=>{const rows=records.filter(r=>r.contracted_month.startsWith(year));return <div key={year} className="grid grid-cols-[160px_minmax(0,1fr)] gap-8 max-md:grid-cols-1 max-md:gap-3">
    <div className="max-md:flex max-md:items-baseline max-md:gap-3"><h3 className="text-[33px] font-heavy leading-none">{year}</h3><p className="mt-2 text-xs text-gray-600 max-md:mt-0">{rows.length}곳 입점</p></div>
    <ul className="border-t-2 border-ink bg-white">
     {rows.map(r=><li key={r.id} className="flex items-center gap-4 border-b border-gray-200 px-5 py-4 max-md:flex-wrap max-md:gap-x-3 max-md:gap-y-1 max-md:px-4">
      <span className="w-10 shrink-0 text-xs text-gray-600">{Number(r.contracted_month.slice(5))}월</span>
      {r.map_url?<a href={r.map_url} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 flex-1 items-center gap-1 text-md font-bold hover:text-brand">{r.name}<ArrowUpRight size={14} className="shrink-0 text-gray-500 group-hover:text-brand"/></a>
       :<span className="min-w-0 flex-1 text-md font-bold">{r.name}</span>}
      <span className="flex items-center gap-2 max-md:w-full max-md:pl-13">
       {r.industry&&<Badge variant="tag" className="text-tiny">{r.industry}</Badge>}
       {r.case_number&&<Link href={`/works/${r.case_number}`}><Badge className="gap-1">중개 사례 보기<ArrowUpRight size={12}/></Badge></Link>}
       {r.map_url&&<a href={r.map_url} target="_blank" rel="noopener noreferrer" aria-label={`${r.name} 네이버 지도`} className="grid size-8 place-items-center rounded-full border border-gray-200 text-gray-700 hover:border-brand hover:text-brand"><MapPin size={16}/></a>}
      </span>
     </li>)}
    </ul>
   </div>;})}
  </div>
 </section>;
}
