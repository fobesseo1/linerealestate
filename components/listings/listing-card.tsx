"use client";
import Link from "next/link";
import {Building2,Heart} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {kindLabel,type Publication} from "@/lib/content/types";
import {detailHref,floorLabel,isWork,price,pyeong} from "@/lib/content/format";
import {cn} from "@/lib/utils";

export function ListingCard({item,saved,onFavorite}:{item:Publication;saved?:boolean;onFavorite?:(number:string)=>void}){
 const c=item.content,href=detailHref(item),photo=c.photos[0]?.url;
 return <article className="group overflow-hidden border-2 border-ink bg-white transition-[translate,box-shadow] duration-200 animate-arrive hover:-translate-y-2 hover:shadow-[8px_8px_0_var(--color-brand)]">
  <div className="relative">
   <Link href={href} className="relative block h-65 overflow-hidden max-md:h-64">
    {photo?<img src={photo} alt={c.title} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-107"/>:<PhotoPlaceholder/>}
    <Badge className="absolute bottom-2 left-2 text-micro">{item.status==="completed"?"거래 완료":kindLabel[c.kind]}</Badge>
   </Link>
   {onFavorite&&!isWork(item)&&<button aria-label={`${c.title} ${saved?"찜 해제":"찜하기"}`} onClick={()=>onFavorite(item.number)} className="absolute right-3 top-3 z-2 grid size-8 place-items-center rounded-full bg-white text-brand max-md:right-2 max-md:top-2 max-md:size-7">
    <Heart size={18} fill={saved?"currentColor":"none"}/>
   </button>}
  </div>
  <Link href={href} className="block p-6">
   <div className="mb-2 flex items-center justify-between text-tiny text-gray-600 max-md:flex-col max-md:items-start max-md:gap-1"><span className="text-gray-800">{c.industry||kindLabel[c.kind]}</span><span>{item.number}</span></div>
   <h3 className="text-xl font-extrabold leading-normal tracking-[-0.045em] max-md:min-h-9">{c.title}</h3>
   {!isWork(item)&&<div className="mt-4 text-[19px] font-extrabold leading-[1.7] text-brand">{c.kind==="sale"?`매매 ${price(c.salePrice)}`:`보증금 ${price(c.deposit)} / 월세 ${price(c.rent)}`}</div>}
   <p className="mb-3 mt-4 text-body leading-[1.8] text-gray-800">{c.description.slice(0,75)}</p>
  </Link>
 </article>;
}

export function PhotoPlaceholder({className}:{className?:string}){
 return <div className={cn("flex size-full min-h-50 flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center text-gray-500",className)}><Building2/><span className="text-caption">사진 준비 중</span></div>;
}

/** Compact listing card for grids of 4: photo, facts, title and price only. */
export function CompactListingCard({item,saved,onFavorite}:{item:Publication;saved?:boolean;onFavorite?:(number:string)=>void}){
 const c=item.content,href=detailHref(item),photo=c.photos[0]?.url;
 const facts=[item.number,floorLabel(c),c.area?`약 ${pyeong(c.area)}평`:""].filter(Boolean).join(" · ");
 return <article data-companion-title={c.title} className="group relative flex flex-col overflow-hidden border-2 border-ink bg-white transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-brand)]">
  <Link href={href} className="relative block aspect-[3/2] overflow-hidden">
   {photo?<img src={photo} alt={c.title} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105"/>:<PhotoPlaceholder className="min-h-0"/>}
   <Badge className="absolute left-3 top-3">{item.status==="completed"?"거래 완료":kindLabel[c.kind]}</Badge>
  </Link>
  {onFavorite&&<button aria-label={`${c.title} ${saved?"찜 해제":"찜하기"}`} onClick={()=>onFavorite(item.number)} className="absolute right-3 top-3 z-2 grid size-8 place-items-center rounded-full bg-white text-brand">
   <Heart size={16} fill={saved?"currentColor":"none"}/>
  </button>}
  <Link href={href} className="flex flex-1 flex-col gap-2 p-4">
   <small className="text-tiny text-gray-500">{facts}</small>
   <h3 className="line-clamp-2 min-h-11 text-md font-extrabold leading-snug group-hover:text-brand">{c.title}</h3>
   <p className="mt-auto flex flex-wrap items-baseline gap-x-2 text-tiny text-gray-500">
    {c.kind==="sale"?<>매매가 <strong className="text-lg font-strong text-brand">{price(c.salePrice)}</strong></>
     :<>보증금 <strong className="text-md font-strong text-brand">{price(c.deposit)}</strong>월세 <strong className="text-md font-strong text-brand">{price(c.rent)}</strong></>}
   </p>
  </Link>
 </article>;
}
