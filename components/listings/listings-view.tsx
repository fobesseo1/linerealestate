"use client";
import {useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {NativeSelect} from "@/components/ui/native-select";
import {useSite} from "@/components/site/site-context";
import {usePublications} from "@/lib/content/use-publications";
import type {Publication} from "@/lib/content/types";
import {ListingCard} from "./listing-card";

export type ListingFilters={type?:"lease"|"sale";industry?:string;rent?:string;q?:string;saved?:boolean};

const industries=["전체","카페","음식점","뷰티·서비스","상가 매매"];
const rents=[["all","월세 전체"],["150","150만원 이하"],["250","250만원 이하"],["400","400만원 이하"]];

function toQuery(f:ListingFilters){
 const params=new URLSearchParams();
 if(f.type)params.set("type",f.type);
 if(f.industry)params.set("industry",f.industry);
 if(f.rent)params.set("rent",f.rent);
 if(f.q)params.set("q",f.q);
 if(f.saved)params.set("saved","1");
 const query=params.toString();
 return query?`?${query}`:"";
}

/** Public listings. Filters live in the address so filtered lists can be shared. */
export function ListingsView({initial,filters:start}:{initial:Publication[]|null;filters:ListingFilters}){
 const {items,failed}=usePublications(initial);
 const {favorites,toggleFavorite}=useSite();
 const [filters,setFilters]=useState(start);
 useEffect(()=>{window.history.replaceState(null,"",`/listings${toQuery(filters)}`);},[filters]);
 const category=filters.type==="sale"?"상가 매매":filters.industry||"전체";
 const title=filters.saved?"찜한 매물":filters.type==="sale"?"산본 상가 매매":filters.type==="lease"?"산본 상가 임대차":"산본 상가 매물";
 const shown=items.filter(({number,content:c})=>c.kind!=="work"
  &&(!filters.saved||favorites.includes(number))
  &&(filters.type!=="lease"||c.kind==="lease")
  &&(filters.type!=="sale"||c.kind==="sale")
  &&(!filters.industry||c.industry.includes(filters.industry))
  &&(!filters.rent||(c.rent!==""&&Number(c.rent)<=Number(filters.rent)))
  &&(!filters.q||`${c.title} ${c.industry} ${c.showMap?c.address:""}`.includes(filters.q)));
 return <>
  <section className="page pt-10 max-md:pt-6">
   <h1 className="text-[clamp(27px,3vw,44px)] font-heavy">{title}</h1>
   <div className="mb-5 flex flex-wrap items-center justify-between gap-5 border-b border-t border-b-gray-200 border-t-ink py-5 max-md:flex-col max-md:items-start max-md:gap-3">
    <div className="flex items-center gap-3 text-xs max-md:w-full max-md:flex-wrap">
     <NativeSelect aria-label="매물 업종" value={category} wrapperClassName="min-w-38 max-md:min-w-35 max-md:flex-1" onChange={event=>{const value=event.target.value;setFilters({...filters,saved:false,type:value==="상가 매매"?"sale":"lease",industry:value==="상가 매매"||value==="전체"?undefined:value});}}>
      {industries.map(label=><option key={label} value={label}>{label==="전체"?"전체 업종":label}</option>)}
     </NativeSelect>
     <NativeSelect aria-label="월세 상한" value={filters.rent||"all"} wrapperClassName="min-w-38 max-md:min-w-35 max-md:flex-1" onChange={event=>setFilters({...filters,rent:event.target.value==="all"?undefined:event.target.value})}>
      {rents.map(([value,label])=><option key={value} value={value}>{label}</option>)}
     </NativeSelect>
     <Button variant="outline" className="h-11 rounded-sm bg-white px-4 text-body text-gray-900 hover:bg-gray-50" onClick={()=>setFilters({})}>조건 초기화</Button>
    </div>
    <span className="text-xs text-gray-800">사진과 조건을 확인하고, 현장에서 함께 살펴보세요.</span>
   </div>
  </section>
  {shown.length?<CardGrid title="새로 등록한 상가">{shown.map(item=><ListingCard key={item.id} item={item} saved={favorites.includes(item.number)} onFavorite={toggleFavorite}/>)}</CardGrid>
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
  <div className="mb-4"><Heading className="text-[30px] font-extrabold leading-normal">{title}</Heading><p className="mb-5 mt-3 text-xs text-gray-500">김영선 공인중개사가 확인하고 게시한 자료입니다.</p></div>
  <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">{children}</div>
 </section>;
}

export function EmptyState({children}:{children:React.ReactNode}){
 return <div className="page flex min-h-65 flex-col items-center justify-center gap-4 p-8 text-center text-gray-600">{children}</div>;
}
