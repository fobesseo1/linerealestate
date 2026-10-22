"use client";
import {useEffect,useRef,useState} from "react";
import {ChevronLeft,ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {NativeSelect} from "@/components/ui/native-select";
import {useSite} from "@/components/site/site-context";
import {usePublications} from "@/lib/content/use-publications";
import type {Publication} from "@/lib/content/types";
import {isGroundFloor,noPremium} from "@/lib/content/format";
import {cn} from "@/lib/utils";
import {CompactListingCard,ListingCard} from "./listing-card";

export type ListingFilters={type?:"lease"|"sale";industry?:string;rent?:string;q?:string;saved?:boolean;floor?:"1";premium?:"0";page?:number};

const perPage=12;

const industries=["전체","카페","음식점","뷰티·서비스","상가 매매"];
const rents=[["all","월세 전체"],["150","150만원 이하"],["250","250만원 이하"],["400","400만원 이하"]];

function toQuery(f:ListingFilters){
 const params=new URLSearchParams();
 if(f.type)params.set("type",f.type);
 if(f.industry)params.set("industry",f.industry);
 if(f.rent)params.set("rent",f.rent);
 if(f.q)params.set("q",f.q);
 if(f.saved)params.set("saved","1");
 if(f.floor)params.set("floor",f.floor);
 if(f.premium)params.set("premium",f.premium);
 if(f.page&&f.page>1)params.set("page",String(f.page));
 const query=params.toString();
 return query?`?${query}`:"";
}

/** Public listings. Filters live in the address so filtered lists can be shared. */
export function ListingsView({initial,filters:start}:{initial:Publication[]|null;filters:ListingFilters}){
 const {items,failed}=usePublications(initial);
 const {favorites,toggleFavorite}=useSite();
 const [filters,setFiltersState]=useState(start);
 const top=useRef<HTMLDivElement>(null);
 // Any filter change starts again from the first page.
 const setFilters=(next:ListingFilters)=>setFiltersState({...next,page:undefined});
 useEffect(()=>{window.history.replaceState(null,"",`/listings${toQuery(filters)}`);},[filters]);
 const category=filters.type==="sale"?"상가 매매":filters.industry||"전체";
 const title=filters.saved?"찜한 매물":filters.type==="sale"?"산본 상가 매매":filters.type==="lease"?"산본 상가 임대차":"산본 상가 매물";
 const shown=items.filter(({number,content:c})=>c.kind!=="work"
  &&(!filters.saved||favorites.includes(number))
  &&(filters.type!=="lease"||c.kind==="lease")
  &&(filters.type!=="sale"||c.kind==="sale")
  &&(!filters.industry||c.industry.includes(filters.industry))
  &&(!filters.rent||(c.rent!==""&&Number(c.rent)<=Number(filters.rent)))
  &&(!filters.floor||isGroundFloor(c))
  &&(!filters.premium||noPremium(c))
  &&(!filters.q||`${c.title} ${c.industry} ${c.showMap?c.address:""}`.includes(filters.q)));
 const pages=Math.max(1,Math.ceil(shown.length/perPage)),page=Math.min(filters.page||1,pages);
 return <>
  <section className="page pt-10 max-md:pt-6">
   <h1 className="text-[clamp(27px,3vw,44px)] font-heavy tracking-[-1px]">{title}</h1>
   <div className="mb-5 flex flex-wrap items-center justify-between gap-5 border-b border-t border-b-gray-200 border-t-[#222] py-5 max-md:flex-col max-md:items-start max-md:gap-3">
    <div className="flex items-center gap-3 text-xs max-md:w-full max-md:flex-wrap">
     <NativeSelect aria-label="매물 업종" value={category} wrapperClassName="min-w-38 max-md:min-w-35 max-md:flex-1" onChange={event=>{const value=event.target.value;setFilters({...filters,saved:false,type:value==="상가 매매"?"sale":"lease",industry:value==="상가 매매"||value==="전체"?undefined:value});}}>
      {industries.map(label=><option key={label} value={label}>{label==="전체"?"전체 업종":label}</option>)}
     </NativeSelect>
     <NativeSelect aria-label="월세 상한" value={filters.rent||"all"} wrapperClassName="min-w-38 max-md:min-w-35 max-md:flex-1" onChange={event=>setFilters({...filters,rent:event.target.value==="all"?undefined:event.target.value})}>
      {rents.map(([value,label])=><option key={value} value={value}>{label}</option>)}
     </NativeSelect>
     <Toggle pressed={!!filters.floor} onClick={()=>setFilters({...filters,floor:filters.floor?undefined:"1"})}>1층만</Toggle>
     <Toggle pressed={!!filters.premium} onClick={()=>setFilters({...filters,premium:filters.premium?undefined:"0"})}>무권리</Toggle>
     <Button variant="outline" className="h-11 rounded-sm bg-white px-4 text-body text-gray-900 hover:bg-gray-50" onClick={()=>setFilters({})}>조건 초기화</Button>
    </div>
    <span className="text-xs text-gray-800">사진과 조건을 확인하고, 현장에서 함께 살펴보세요.</span>
   </div>
  </section>
  {shown.length?<section ref={top} className="page scroll-mt-6 pb-18 pt-2">
   <p className="mb-4 text-xs text-gray-600"><b className="text-ink">{shown.length}개</b> 매물 · 김영선 공인중개사가 확인하고 게시한 자료입니다.</p>
   <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">
    {shown.slice((page-1)*perPage,page*perPage).map(item=><CompactListingCard key={item.id} item={item} saved={favorites.includes(item.number)} onFavorite={toggleFavorite}/>)}
   </div>
   {pages>1&&<Pagination page={page} pages={pages} onPage={next=>{setFiltersState({...filters,page:next});top.current?.scrollIntoView({behavior:"smooth"});}}/>}
  </section>
   :<EmptyState>{failed?"자료를 불러오지 못했습니다. 새로고침해 주세요.":"조건에 맞는 공개 매물이 없습니다. 조건을 넓혀 살펴보세요."}</EmptyState>}
 </>;
}

export function WorksView({initial}:{initial:Publication[]|null}){
 const {items,failed}=usePublications(initial);
 const works=items.filter(item=>item.content.kind==="work");
 if(!works.length)return <EmptyState>{failed?"사례를 불러오지 못했습니다. 새로고침해 주세요.":"아직 게시된 중개 사례가 없습니다."}</EmptyState>;
 return <CardGrid title="계약 너머, 오픈까지 함께한 사례" heading="h1">{works.map(item=><ListingCard key={item.id} item={item}/>)}</CardGrid>;
}

function CardGrid({title,heading:Heading="h2",children}:{title:string;heading?:"h1"|"h2";children:React.ReactNode}){
 return <section className="page pb-18 pt-7">
  <div className="mb-4"><Heading className="text-[30px] font-extrabold leading-normal tracking-[-1px]">{title}</Heading><p className="mb-5 mt-3 text-xs text-gray-500">김영선 공인중개사가 확인하고 게시한 자료입니다.</p></div>
  <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">{children}</div>
 </section>;
}

export function EmptyState({children}:{children:React.ReactNode}){
 return <div className="page flex min-h-65 flex-col items-center justify-center gap-4 p-8 text-center text-gray-600">{children}</div>;
}

function Toggle({pressed,onClick,children}:{pressed:boolean;onClick:()=>void;children:React.ReactNode}){
 return <Button variant="outline" aria-pressed={pressed} onClick={onClick} className="h-11 rounded-sm bg-white px-4 text-body text-gray-900 hover:bg-gray-50 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white">{children}</Button>;
}

function Pagination({page,pages,onPage}:{page:number;pages:number;onPage:(page:number)=>void}){
 const item="grid size-10 place-items-center border border-gray-300 bg-white text-sm disabled:opacity-35";
 return <nav aria-label="매물 페이지" className="mt-10 flex items-center justify-center gap-2">
  <button className={item} disabled={page===1} onClick={()=>onPage(page-1)} aria-label="이전 페이지"><ChevronLeft size={16}/></button>
  {Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} onClick={()=>onPage(n)} aria-current={n===page?"page":undefined} className={cn(item,n===page&&"border-ink bg-ink font-bold text-white")}>{n}</button>)}
  <button className={item} disabled={page===pages} onClick={()=>onPage(page+1)} aria-label="다음 페이지"><ChevronRight size={16}/></button>
 </nav>;
}
