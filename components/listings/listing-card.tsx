"use client";
import Link from "next/link";
import {Building2,Heart} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {kindLabel,type Publication} from "@/lib/content/types";
import {detailHref,floorLabel,isWork,price,pyeong} from "@/lib/content/format";
import {cn} from "@/lib/utils";

export function ListingCard({item,saved,onFavorite}:{item:Publication;saved?:boolean;onFavorite?:(number:string)=>void}){
 const c=item.content,href=detailHref(item),photo=c.photos[0]?.url,done=isContracted(item);
 return <article className="group overflow-hidden border-2 border-ink bg-white transition-[translate,box-shadow] duration-200 animate-arrive hover:-translate-y-2 hover:shadow-[8px_8px_0_var(--color-brand)]">
  <div className="relative">
   <Link href={href} className="relative block h-65 overflow-hidden max-md:h-64">
    {photo?<img src={photo} alt={c.title} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-107"/>:<PhotoPlaceholder/>}
    {done?<ContractedMark/>:<Badge className="absolute bottom-2 left-2 text-micro">{kindLabel[c.kind]}</Badge>}
   </Link>
   {onFavorite&&!isWork(item)&&<button aria-label={`${c.title} ${saved?"찜 해제":"찜하기"}`} onClick={()=>onFavorite(item.number)} className="absolute right-3 top-3 z-2 grid size-8 place-items-center rounded-full bg-white text-brand max-md:right-2 max-md:top-2 max-md:size-7">
    <Heart size={18} fill={saved?"currentColor":"none"}/>
   </button>}
  </div>
  <Link href={href} className="block p-6">
   <div className="mb-2 flex items-center justify-between text-tiny text-gray-600 max-md:flex-col max-md:items-start max-md:gap-1"><span className="text-gray-800">{c.industry||kindLabel[c.kind]}</span><span>{item.number}</span></div>
   <h3 className="text-xl font-extrabold leading-normal tracking-[-0.045em] max-md:min-h-9">{c.title}</h3>
   {!isWork(item)&&<div className={cn("mt-4 text-[19px] font-extrabold leading-[1.7] text-brand",done&&"text-gray-500 line-through")}>{c.kind==="sale"?`매매 ${price(c.salePrice)}`:`보증금 ${price(c.deposit)} / 월세 ${price(c.rent)}`}</div>}
   <p className="mb-3 mt-4 line-clamp-3 text-body leading-[1.8] text-gray-800">{c.description}</p>
  </Link>
 </article>;
}

/** A listing the owner marked 계약완료 in the admin (published status "completed"). Completed cases (kind "work") are not listings. */
export const isContracted=(item:Publication)=>item.status==="completed"&&!isWork(item);

/** 계약완료 mark over a listing photo: darkened photo, tilted stamp in the middle and a top-left ribbon (top-right holds the 찜 button). Owner-approved design 2026-11-26. */
export function ContractedMark({compact}:{compact?:boolean}){
 return <div aria-label="계약완료" role="img" className="pointer-events-none absolute inset-0 overflow-hidden">
  <div className="absolute inset-0 grid place-items-center bg-ink/55">
   <div className={cn("-rotate-8 border-white bg-brand text-center text-white outline-brand",compact?"border-3 px-4 py-2 outline-2":"border-5 px-7 py-3 outline-3")}>
    <div className={cn("font-bold tracking-eyebrow",compact?"text-micro":"text-xs")}>CONTRACTED</div>
    <div className={cn("font-heavy leading-[1.1]",compact?"text-2xl":"text-[40px]")}>계약완료</div>
   </div>
  </div>
  <div className={cn("absolute rotate-[-35deg] border-y-white bg-brand text-center font-heavy text-white",compact?"-left-14 top-5 w-50 border-y-2 py-1 text-xs":"-left-16 top-8 w-65 border-y-3 py-2 text-md")}>계약완료</div>
 </div>;
}

export function PhotoPlaceholder({className}:{className?:string}){
 return <div className={cn("flex size-full min-h-50 flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center text-gray-500",className)}><Building2/><span className="text-caption">사진 준비 중</span></div>;
}

/** Compact listing card for grids of 4: photo, facts, title and price only. */
export function CompactListingCard({item,saved,onFavorite}:{item:Publication;saved?:boolean;onFavorite?:(number:string)=>void}){
 const c=item.content,href=detailHref(item),photo=c.photos[0]?.url,done=isContracted(item);
 const facts=[item.number,floorLabel(c),c.area?`약 ${pyeong(c.area)}평`:""].filter(Boolean).join(" · ");
 return <article data-companion-title={c.title} className="group relative flex flex-col overflow-hidden border-2 border-ink bg-white transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-brand)]">
  <Link href={href} className="relative block aspect-[3/2] overflow-hidden">
   {photo?<img src={photo} alt={c.title} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105"/>:<PhotoPlaceholder className="min-h-0"/>}
   {done?<ContractedMark compact/>:<Badge className="absolute left-3 top-3">{kindLabel[c.kind]}</Badge>}
  </Link>
  {onFavorite&&<button aria-label={`${c.title} ${saved?"찜 해제":"찜하기"}`} onClick={()=>onFavorite(item.number)} className="absolute right-3 top-3 z-2 grid size-8 place-items-center rounded-full bg-white text-brand">
   <Heart size={16} fill={saved?"currentColor":"none"}/>
  </button>}
  <Link href={href} className="flex flex-1 flex-col gap-2 p-4">
   <small className="text-tiny text-gray-500">{facts}</small>
   <h3 className="line-clamp-2 min-h-11 text-md font-extrabold leading-snug group-hover:text-brand">{c.title}</h3>
   <p className={cn("mt-auto flex flex-wrap items-baseline gap-x-2 text-tiny text-gray-500",done&&"line-through [&_strong]:text-gray-500")}>
    {c.kind==="sale"?<>매매가 <strong className="text-lg font-strong text-brand">{price(c.salePrice)}</strong></>
     :<>보증금 <strong className="text-md font-strong text-brand">{price(c.deposit)}</strong>월세 <strong className="text-md font-strong text-brand">{price(c.rent)}</strong></>}
   </p>
  </Link>
 </article>;
}
