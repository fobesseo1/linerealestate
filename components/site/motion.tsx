"use client";
import {useEffect,useState} from "react";

/** False when the visitor turned motion off or the OS asks for reduced motion. */
export function useSiteMotion(){
 const [moving,setMoving]=useState(true);
 useEffect(()=>{
  const media=matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>setMoving(!media.matches&&document.documentElement.dataset.seonMotion!=="off");
  update();
  window.addEventListener("seon-motion",update);media.addEventListener("change",update);
  return()=>{window.removeEventListener("seon-motion",update);media.removeEventListener("change",update);};
 },[]);
 return moving;
}

export function SiteMotionControl(){
 const moving=useSiteMotion();
 return <button className="absolute right-[5%] top-1 p-1.5 text-tiny text-gray-400 max-md:top-0 max-md:text-micro" aria-pressed={!moving} onClick={()=>{document.documentElement.dataset.seonMotion=moving?"off":"on";window.dispatchEvent(new Event("seon-motion"));}}>
  {moving?"움직임 끄기":"움직임 켜기"}
 </button>;
}
