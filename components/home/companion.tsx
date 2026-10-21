"use client";
import {useEffect,useState,type CSSProperties} from "react";
import {Character} from "@/components/inquiry/character";

type Section="home"|"properties"|"service"|"works";

/** One guide character that floats beside the home page, reacting to scroll position and hovered listings. */
export function Companion({moving,failed,count,onContact}:{moving:boolean;failed:boolean;count:number;onContact:()=>void}){
 const [progress,setProgress]=useState(0),[scrolling,setScrolling]=useState(false),[section,setSection]=useState<Section>("home"),[target,setTarget]=useState(""),[hidden,setHidden]=useState(false);
 useEffect(()=>{
  let raf=0,timer:ReturnType<typeof setTimeout>;
  const update=()=>{
   raf=0;
   setProgress(Math.min(1,window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)));
   let current:Section="home";
   for(const area of document.querySelectorAll<HTMLElement>("[data-section]"))if(area.getBoundingClientRect().top<window.innerHeight*.6)current=area.dataset.section as Section;
   setSection(current);
  };
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);setScrolling(true);clearTimeout(timer);timer=setTimeout(()=>setScrolling(false),220);};
  const over=(event:Event)=>setTarget(event.target instanceof Element?event.target.closest<HTMLElement>("[data-companion-title]")?.dataset.companionTitle||"":"");
  window.addEventListener("scroll",scroll,{passive:true});document.addEventListener("pointerover",over);document.addEventListener("focusin",over);update();
  return()=>{window.removeEventListener("scroll",scroll);document.removeEventListener("pointerover",over);document.removeEventListener("focusin",over);cancelAnimationFrame(raf);clearTimeout(timer);};
 },[]);
 if(hidden)return null;
 const empty=failed||count===0;
 const state=empty?"fail":scrolling&&!target?"think":"success";
 const text=target?`${target.slice(0,28)} · 사진과 조건을 확인해 보세요`:empty?"다른 조건으로 찾아볼까요?":section==="works"?"이곳의 다음 이야기를 만나보세요":section==="service"?"희망 업종과 예산을 함께 정리해요":section==="properties"?`${count}개 매물 · 마음에 드는 사진에 올려 보세요`:"내려 보세요! 함께 따라갈게요";
 return <aside className="fixed bottom-16 right-6 z-35 translate-y-[calc(-1*var(--shift))] text-ink transition-[translate] duration-200 ease-out max-md:bottom-26 max-md:right-2" style={{"--shift":moving?`${Math.round(progress*90)}px`:"0px"} as CSSProperties}>
  <button onClick={onContact} aria-label="캐릭터와 내 조건으로 상담 요청" className="flex max-w-full items-center text-left">
   <Character state={state} moving={moving} loop className={moving&&scrolling?"size-25 animate-hop max-md:size-18":"size-25 max-md:size-18"}/>
   <span className="grid w-55 gap-1 rounded-2xl border border-brand/20 bg-white px-4 py-3 shadow-[0_7px_25px_#20202018] max-md:w-42 max-md:px-3 max-md:py-2">
    <small className="text-tiny text-gray-600">스크롤 동행</small>
    <strong className="text-body leading-normal max-md:text-caption">{text}</strong>
    <em className="text-caption not-italic text-brand">조건 상담 ↗</em>
   </span>
  </button>
  <button aria-label="캐릭터 숨기기" onClick={()=>setHidden(true)} className="absolute -top-2 right-0 size-6 rounded-full border border-gray-200 bg-white text-base leading-4 text-gray-800">×</button>
 </aside>;
}
