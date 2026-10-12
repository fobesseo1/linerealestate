"use client";
import {useEffect,useRef,useState} from "react";

/** Isolated, local canvas artwork supplied by the user. Only animate in view. */
export function DesignCharacter({state="think",moving,loop=false}:{state?:"think"|"success"|"fail";moving:boolean;loop?:boolean}){
 const frame=useRef<HTMLIFrameElement>(null),host=useRef<HTMLSpanElement>(null);
 const [visible,setVisible]=useState(false);
 const sync=()=>frame.current?.contentWindow?.postMessage({type:"line-character-motion",moving,visible,loop},"*");
 useEffect(()=>{if(!host.current)return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.1});observer.observe(host.current);return()=>observer.disconnect();},[]);
 useEffect(()=>{sync();},[moving,visible,loop,state]);
 return <span ref={host} className="dl-character" aria-hidden="true"><iframe ref={frame} key={state} src={`/characters/${state}.html`} sandbox="allow-scripts" title="선부동산 안내 캐릭터" loading="lazy" tabIndex={-1} onLoad={sync}/></span>;
}
