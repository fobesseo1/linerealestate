"use client";
import {useEffect,useRef,useState} from "react";
import type {Photo} from "@/lib/content/types";

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
  return ()=>observer.disconnect();
 },[index]);
 return <section className="property-gallery" aria-label={`${title} 사진`}>
  <div className="gallery-main property-gallery-main" tabIndex={multiple?0:undefined} aria-label="매물 사진. 좌우 방향키로 사진 넘기기" onKeyDown={event=>{if(!multiple)return;if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();move(event.key==="ArrowLeft"?-1:1);}}}
   onPointerDown={event=>{if(event.pointerType==="touch")start.current={x:event.clientX,y:event.clientY};}}
   onPointerUp={event=>{const origin=start.current;start.current=null;if(!origin||!multiple)return;const dx=event.clientX-origin.x,dy=event.clientY-origin.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);}}
   onPointerCancel={()=>{start.current=null;}}>
   <img key={photos[index].path} src={photos[index].url} alt={photos[index].label||title} draggable={false}/>
   {multiple&&<><button type="button" className="property-photo-arrow previous" aria-label="이전 사진" onClick={()=>move(-1)}><span aria-hidden="true"/></button><button type="button" className="property-photo-arrow next" aria-label="다음 사진" onClick={()=>move(1)}><span aria-hidden="true"/></button></>}
   <span className="photo-counter" aria-live="polite" aria-atomic="true">{index+1} / {photos.length}</span>
  </div>
  <div className="managed-photo-thumbnails" ref={strip}>{photos.map((p,i)=><button type="button" key={p.path} aria-label={`사진 ${i+1} 보기`} aria-pressed={index===i} onClick={()=>setIndex(i)}><img src={p.url} alt={p.label||`사진 ${i+1}`} loading="lazy"/></button>)}</div>
 </section>;
}
