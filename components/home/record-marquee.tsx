"use client";
import Link from "next/link";
import type {CSSProperties} from "react";
import {ArrowUpRight} from "lucide-react";
import {useSiteMotion} from "@/components/site/motion";
import {recordPhotoUrl} from "@/lib/content/record-photo";
import type {DealRecord} from "@/lib/content/types";
import {cn} from "@/lib/utils";

/** Store photos from the contract record drifting left to right; a scrollable row when motion is off. */
export function RecordMarquee({records,since}:{records:DealRecord[];since:string}){
 const moving=useSiteMotion();
 if(!records.length)return null;
 const copies=moving?[0,1]:[0];
 return <section aria-label="산본 입점 기록" className="px-gutter pb-16 max-md:pb-10">
  <div className="mb-5 flex items-end justify-between gap-4 border-t-2 border-ink pt-5">
   <div>
    <span className="mb-2 block text-tiny font-bold tracking-[2px] text-brand">STORES WE OPENED</span>
    <h2 className="text-xl font-heavy">산본 입점 기록 <span className="text-brand">· {since}~</span></h2>
   </div>
   <Link href="/works#records" className="flex shrink-0 items-center gap-2 text-xs hover:text-brand">입점 기록 전체 보기 <ArrowUpRight size={16}/></Link>
  </div>
  <div className={cn("[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]",moving?"overflow-hidden":"overflow-x-auto pb-2")}>
   <ul className={cn("flex w-max",moving&&"animate-marquee-right hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]")} style={{"--marquee-duration":`${records.length*4}s`} as CSSProperties}>
    {copies.map(copy=>records.map(r=>{const repeat=copy>0;return <li key={`${copy}-${r.id}`} aria-hidden={repeat||undefined} className="mr-4 w-56 shrink-0 border-2 border-ink bg-white max-md:mr-3 max-md:w-32">
     <a href={r.map_url||"/works#records"} target={r.map_url?"_blank":undefined} rel={r.map_url?"noopener noreferrer":undefined} tabIndex={repeat?-1:undefined} className="group block">
      <div className="aspect-[4/3] overflow-hidden"><img src={recordPhotoUrl(r)} alt={repeat?"":`${r.name} 매장 사진`} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105"/></div>
      <div className="p-3 max-md:p-2">
       <small className="block text-tiny text-gray-500">{r.contracted_month.replace("-",".")}{r.industry&&` · ${r.industry}`}</small>
       <strong className="mt-1 block truncate text-body group-hover:text-brand max-md:text-caption">{r.name}</strong>
      </div>
     </a>
    </li>;}))}
   </ul>
  </div>
 </section>;
}
