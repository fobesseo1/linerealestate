"use client";
import {useEffect,useRef,useState} from "react";
import type {Photo} from "@/lib/content/types";
import {cn} from "@/lib/utils";

/** Photo viewer: arrow buttons, ←/→ keys, touch swipe; the selected thumbnail scrolls into view. */
export function PropertyGallery({photos,title}:{photos:Photo[];title:string}){
 const [index,setIndex]=useState(0);
 const strip=useRef<HTMLDivElement>(null);
 const start=useRef<{x:number;y:number}|null>(null);
 const multiple=photos.length>1;
 const move=(step:number)=>setIndex(current=>(current+step+photos.length)%photos.length);
 useEffect(()=>{
  const rail=strip.current,selected=rail?.children[index] as HTMLElement|undefined;
  if(!rail||!selected)return;
  const reveal=()=>{if(selected.offsetLeft<rail.scrollLeft||selected.offsetLeft+selected.offsetWidth>rail.scrollLeft+rail.clientWidth){
   rail.scrollTo({left:selected.offsetLeft-(rail.clientWidth-selected.offsetWidth)/2,behavior:"instant"});
  }};
  reveal();
  const observer=new ResizeObserver(reveal);observer.observe(rail);
  return()=>observer.disconnect();
 },[index]);
 return <section aria-label={`${title} 사진`}>
  <div tabIndex={multiple?0:undefined} aria-label="매물 사진. 좌우 방향키로 사진 넘기기"
   className="relative isolate h-88 touch-pan-y overflow-hidden border border-gray-200 bg-ink focus-visible:outline-3 focus-visible:outline-offset-4 max-md:aspect-[4/3] max-md:h-auto"
   onKeyDown={event=>{if(multiple&&(event.key==="ArrowLeft"||event.key==="ArrowRight")){event.preventDefault();move(event.key==="ArrowLeft"?-1:1);}}}
   onPointerDown={event=>{if(event.pointerType==="touch")start.current={x:event.clientX,y:event.clientY};}}
   onPointerUp={event=>{const origin=start.current;start.current=null;if(!origin||!multiple)return;const dx=event.clientX-origin.x,dy=event.clientY-origin.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);}}
   onPointerCancel={()=>{start.current=null;}}>
   <img key={photos[index].path} src={photos[index].url} alt={photos[index].label||title} draggable={false} className="size-full animate-photo-reveal bg-[#f5f3f0] object-contain"/>
   {multiple&&<><Arrow direction="previous" onClick={()=>move(-1)}/><Arrow direction="next" onClick={()=>move(1)}/></>}
   <span aria-live="polite" aria-atomic="true" className="absolute bottom-3 right-3 rounded-sm bg-black/70 px-2 py-1 text-micro text-white">{index+1} / {photos.length}</span>
  </div>
  <div ref={strip} className="relative my-3 flex max-w-full gap-3 overflow-x-auto">
   {photos.map((photo,i)=><button type="button" key={photo.path} aria-label={`사진 ${i+1} 보기`} aria-pressed={index===i} onClick={()=>setIndex(i)} className="h-18 w-25 shrink-0 overflow-hidden border border-gray-200 aria-pressed:border-3 aria-pressed:border-brand">
    <img src={photo.url} alt={photo.label||`사진 ${i+1}`} loading="lazy" className="size-full object-cover"/>
   </button>)}
  </div>
 </section>;
}

function Arrow({direction,onClick}:{direction:"previous"|"next";onClick:()=>void}){
 const previous=direction==="previous";
 return <button type="button" aria-label={previous?"이전 사진":"다음 사진"} onClick={onClick} className={cn(
  "group absolute top-1/2 z-2 grid size-14 -translate-y-1/2 place-items-center rounded-full border border-brand/20 bg-white/95 text-brand shadow-[0_4px_16px_#19191f18] transition-[background-color,color,box-shadow,scale] duration-200 hover:scale-108 hover:bg-brand hover:text-white hover:shadow-[0_0_0_8px_#e00b4114,0_6px_20px_#e00b4140] focus-visible:outline-3 focus-visible:outline-ink active:scale-94 max-md:size-11",
  previous?"left-[14%] max-md:left-3":"right-[14%] max-md:right-3",
 )}>
  <span aria-hidden="true" className={cn("block size-0 border-y-10 border-y-transparent group-hover:animate-arrow-nudge",previous?"-ml-1 border-r-[15px] border-r-current group-hover:[animation-direction:reverse]":"ml-1 border-l-[15px] border-l-current")}/>
 </button>;
}
