"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";

/** Isolated, local canvas artwork supplied by the user. Only animate in view. */
export function DesignCharacter({state="think",moving,loop=false}:{state?:"think"|"success"|"fail";moving:boolean;loop?:boolean}){
 const frame=useRef<HTMLIFrameElement>(null),host=useRef<HTMLSpanElement>(null);
 const [visible,setVisible]=useState(false);
 const sync=()=>frame.current?.contentWindow?.postMessage({type:"line-character-motion",moving,visible,loop},"*");
 useEffect(()=>{if(!host.current)return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.1});observer.observe(host.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{sync();},[moving,visible,loop,state]);
 return <span ref={host} className="dl-character" aria-hidden="true"><iframe ref={frame} key={state} src={`/characters/${state}.html`} sandbox="allow-scripts" title="선부동산 안내 캐릭터" loading="lazy" tabIndex={-1} onLoad={sync}/></span>;
}

export function DesignCompanion({variant,moving,loaded,failed,count,onContact}:{variant:"dynamic"|"market"|"cinematic"|"balanced";moving:boolean;loaded:boolean;failed:boolean;count:number;onContact:()=>void}){
 const [progress,setProgress]=useState(0),[scrolling,setScrolling]=useState(false),[section,setSection]=useState("home"),[target,setTarget]=useState(""),[hidden,setHidden]=useState(false);
 useEffect(()=>{
  let raf=0,timer:ReturnType<typeof setTimeout>;
  const update=()=>{raf=0;setProgress(Math.min(1,window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)));const areas=[...document.querySelectorAll<HTMLElement>(".dl-hero,.dl-properties,.dl-service,.dl-works")];let current="home";for(const area of areas){if(area.getBoundingClientRect().top<window.innerHeight*.6)current=area.classList.contains("dl-properties")?"properties":area.classList.contains("dl-service")?"service":area.classList.contains("dl-works")?"works":"home";}setSection(current);};
  const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);setScrolling(true);clearTimeout(timer);timer=setTimeout(()=>setScrolling(false),220);};
  const over=(event:Event)=>{const element=event.target instanceof Element?event.target.closest(".dl-card,.dl-work"):null;setTarget(element?.querySelector("h3")?.textContent||"");};
  window.addEventListener("scroll",scroll,{passive:true});document.addEventListener("pointerover",over);document.addEventListener("focusin",over);update();
  return()=>{window.removeEventListener("scroll",scroll);document.removeEventListener("pointerover",over);document.removeEventListener("focusin",over);cancelAnimationFrame(raf);clearTimeout(timer);};
 },[]);
 if(hidden)return null;
 const empty=loaded&&(failed||count===0),state=empty?"fail":!loaded||scrolling&&!target?"think":"success";
 const text=target?`${target.slice(0,28)} · 사진과 조건을 확인해 보세요`:!loaded?"매물 자료를 불러오고 있어요":empty?"다른 조건으로 찾아볼까요?":section==="works"?"이곳의 다음 이야기를 만나보세요":section==="service"?"희망 업종과 예산을 함께 정리해요":section==="properties"?`${count}개 매물 · 마음에 드는 사진에 올려 보세요`:variant==="dynamic"?"내려 보세요! 함께 따라갈게요":variant==="market"?"매물에 올리면 제가 반응해요":variant==="cinematic"?"스크롤하면 옆에서 인사할게요":"페이지를 따라 함께 걸어볼까요?";
 const styles={"--companion-progress":moving?progress:0,"--companion-shift":moving?`${Math.round(progress*90)}px`:"0px"} as CSSProperties;
 return <aside className={`dl-companion dl-companion-${variant} ${moving&&scrolling?"is-scrolling":""} ${target?"has-target":""}`} style={styles} data-section={section}>
  <div className="dl-companion-track"><button className="dl-companion-body" onClick={onContact} aria-label="캐릭터와 내 조건으로 상담 요청"><DesignCharacter state={state} moving={moving} loop/><span className="dl-companion-bubble"><small>{variant==="dynamic"?"스크롤 동행":variant==="market"?"매물 탐색 도우미":variant==="cinematic"?"사진 속 자리 찾기":"산본 산책 안내"}</small><strong>{text}</strong><em>조건 상담 ↗</em></span></button></div>
  <button className="dl-companion-dismiss" aria-label="캐릭터 숨기기" onClick={()=>setHidden(true)}>×</button>
 </aside>;
}
