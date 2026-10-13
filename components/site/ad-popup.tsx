"use client";
import {useEffect,useState} from "react";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

const seenKey="seon-ad-v2-seen",hideKey="seon-ad-v2-hide-until";
export const openAdEvent="seon-ad-open";

/** Promotional video: opens once per home visit, again from the menu; never alongside the contact dialog. */
export function AdPopup({active,onContact}:{active:boolean;onContact:()=>void}){
 const [open,setOpen]=useState(false),[hideDay,setHideDay]=useState(false);
 function show(){try{sessionStorage.setItem(seenKey,"1");}catch{/* Storage may be unavailable. */}setOpen(true);}
 function change(next:boolean){
  if(!next&&hideDay){try{localStorage.setItem(hideKey,String(Date.now()+86400000));}catch{/* Storage may be unavailable. */}}
  setOpen(next);
 }
 useEffect(()=>{window.addEventListener(openAdEvent,show);return()=>window.removeEventListener(openAdEvent,show);},[]);
 useEffect(()=>{
  if(!active){setOpen(false);return;}
  try{if(sessionStorage.getItem(seenKey)||Number(localStorage.getItem(hideKey))>Date.now())return;}catch{/* Show when storage is unavailable. */}
  const timer=setTimeout(()=>{try{if(sessionStorage.getItem(seenKey))return;}catch{/* Show anyway. */}show();},2200);
  return()=>clearTimeout(timer);
 },[active]);
 return <Dialog open={open} onOpenChange={change}>
  <DialogContent className="max-w-[410px] border-ink-line bg-ink p-5 text-white max-md:max-w-[calc(100vw-24px)] max-md:p-4 [&>button:last-child]:hover:bg-ink-line">
   <DialogTitle className="pr-9 text-[19px] font-strong max-md:text-lead">산본의 상가, 함께 찾아보세요</DialogTitle>
   <DialogDescription className="mb-3 mt-1 text-caption text-gray-400">선부동산 소개 영상 · 30초</DialogDescription>
   <video src="/videos/seon-ad-vertical-v2.mp4" poster="/videos/seon-ad-poster.jpg" autoPlay muted playsInline controls preload="metadata" aria-label="선부동산 소개 광고 영상" className="mx-auto block aspect-[9/16] h-[min(60dvh,600px)] w-auto max-w-full bg-ink object-contain max-md:h-[55dvh]"/>
   <div className="mt-4 grid gap-3">
    <Button variant="brand" className="h-auto p-3 text-body font-bold" onClick={()=>{change(false);onContact();}}>내 조건으로 상담 요청 ↗</Button>
    <label className="flex items-center justify-center gap-2 text-caption text-gray-400"><input type="checkbox" checked={hideDay} onChange={event=>setHideDay(event.target.checked)} className="accent-brand"/>하루 동안 다시 보지 않기</label>
   </div>
  </DialogContent>
 </Dialog>;
}
