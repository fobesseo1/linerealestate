"use client";
import {useEffect,useState} from "react";
export function useSiteMotion(){
 const [moving,setMoving]=useState(true);
 useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setMoving(!media.matches&&document.documentElement.dataset.seonMotion!=="off");update();window.addEventListener("seon-motion",update);media.addEventListener("change",update);return()=>{window.removeEventListener("seon-motion",update);media.removeEventListener("change",update);};},[]);
 return moving;
}
export function SiteMotionControl(){const moving=useSiteMotion();return <button className="site-motion-control" aria-pressed={!moving} onClick={()=>{document.documentElement.dataset.seonMotion=moving?"off":"on";window.dispatchEvent(new Event("seon-motion"));}}>{moving?"움직임 끄기":"움직임 켜기"}</button>;}
