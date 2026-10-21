"use client";
import Link from "next/link";
import {Building2,Heart} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {kindLabel,type Publication} from "@/lib/content/types";
import {detailHref,isWork,price} from "@/lib/content/format";
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
