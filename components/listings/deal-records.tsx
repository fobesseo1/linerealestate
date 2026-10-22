import Link from "next/link";
import {ArrowUpRight,Building2,MapPin} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import config from "@/lib/content/public-config.json";
import {publicBucket} from "@/lib/content/client";
import type {DealRecord} from "@/lib/content/types";

// The version query makes a replaced photo show up immediately at the same path.
const photoUrl=(r:DealRecord)=>`${config.url}/storage/v1/object/public/${publicBucket}/${r.photo_path}?v=${encodeURIComponent(r.updated_at)}`;

/** Selected brokered stores by year (not a complete list); detailed stories link to their case page. */
export function DealRecords({records}:{records:DealRecord[]}){
 if(!records.length)return null;
 const years=[...new Set(records.map(r=>r.contracted_month.slice(0,4)))];
 const first=years[years.length-1];
 const industries=[...new Set(records.map(r=>r.industry).filter(Boolean))];
 return <section id="records" className="page scroll-mt-22 pb-18 pt-4">
  <div className="mb-10 border-b-4 border-brand bg-ink p-10 text-white max-md:px-6 max-md:py-7">
   <span className="text-tiny font-demibold tracking-[.12em] text-brand">CONTRACTS SINCE {first}</span>
   <h2 className="my-3 text-[clamp(26px,3vw,40px)] font-heavy leading-[1.3]">{first}년부터 이어 온 산본 입점 기록</h2>
   <p className="text-sm leading-[1.8] text-gray-400 max-md:text-body">김영선 공인중개사가 중개한 매장 가운데 일부를 소개합니다. 매장을 누르면 네이버 플레이스에서 지금 모습을 확인할 수 있습니다.</p>
   <div className="mt-6 flex flex-wrap gap-2">
    {industries.map(industry=><span key={industry} className="rounded-sm border border-ink-line bg-ink-raised px-3 py-1 text-xs text-white">{industry}</span>)}
   </div>
  </div>
  <div className="grid gap-12">
   {years.map(year=><div key={year}>
    <h3 className="mb-4 flex items-center gap-4 text-[33px] font-heavy leading-none after:h-0.5 after:flex-1 after:bg-ink">{year}</h3>
    <ul className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">
     {records.filter(r=>r.contracted_month.startsWith(year)).map(r=><RecordCard key={r.id} record={r}/>)}
    </ul>
   </div>)}
  </div>
 </section>;
}

function RecordCard({record:r}:{record:DealRecord}){
 const photo=r.photo_path?<img src={photoUrl(r)} alt={`${r.name} 매장 사진`} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105"/>
  :<div className="flex size-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500"><Building2 size={28}/><span className="text-caption">사진 준비 중</span></div>;
 const body=<>
  <div className="relative aspect-[4/3] overflow-hidden">
   {photo}
   <Badge variant="light" className="absolute left-3 top-3 font-demibold">{Number(r.contracted_month.slice(5))}월</Badge>
  </div>
  <div className="flex flex-1 flex-col gap-2 p-4 max-md:p-3">
   <strong className="flex items-start justify-between gap-2 text-md leading-snug max-md:text-body">{r.name}{r.map_url&&<ArrowUpRight size={16} className="mt-0.5 shrink-0 text-gray-500 group-hover:text-brand"/>}</strong>
   <span className="mt-auto flex flex-wrap items-center gap-2 text-caption text-gray-600">{r.industry&&<Badge variant="tag" className="text-tiny">{r.industry}</Badge>}{r.map_url&&<span className="flex items-center gap-1 max-md:hidden"><MapPin size={12}/>네이버 플레이스</span>}</span>
  </div>
 </>;
 return <li className="group relative flex flex-col overflow-hidden border-2 border-ink bg-white transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-brand)]">
  {r.map_url?<a href={r.map_url} target="_blank" rel="noopener noreferrer" aria-label={`${r.name} 네이버 플레이스에서 보기`} className="flex flex-1 flex-col">{body}</a>:<div className="flex flex-1 flex-col">{body}</div>}
  {r.case_number&&<Link href={`/works/${r.case_number}`} className="absolute right-3 top-3"><Badge className="gap-1 font-demibold">중개 사례<ArrowUpRight size={12}/></Badge></Link>}
 </li>;
}
