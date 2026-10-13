"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {cn} from "@/lib/utils";

export type CharacterState="think"|"success"|"fail";

/** User-supplied canvas artwork, isolated in a sandboxed frame and animated only while visible. */
export function Character({state="think",moving,loop=false,className}:{state?:CharacterState;moving:boolean;loop?:boolean;className?:string}){
 const frame=useRef<HTMLIFrameElement>(null),host=useRef<HTMLSpanElement>(null);
 const [visible,setVisible]=useState(false);
 const sync=useCallback(()=>frame.current?.contentWindow?.postMessage({type:"line-character-motion",moving,visible,loop},"*"),[moving,visible,loop]);
 useEffect(()=>{
  if(!host.current)return;
  const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.1});
  observer.observe(host.current);
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{sync();},[sync,state]);
 return <span ref={host} className={cn("pointer-events-none inline-block size-24 shrink-0",className)} aria-hidden="true">
  <iframe ref={frame} key={state} src={`/characters/${state}.html`} sandbox="allow-scripts" title="선부동산 안내 캐릭터" loading="lazy" tabIndex={-1} onLoad={sync} className="block size-full border-0 bg-transparent"/>
 </span>;
}
