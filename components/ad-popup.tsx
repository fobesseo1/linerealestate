"use client";
import {useEffect,useState} from "react";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "./ui/dialog";

const seenKey="seon-ad-v2-seen",hideKey="seon-ad-v2-hide-until";
export function AdPopup({active,onContact}:{active:boolean;onContact:()=>void}){
 const [open,setOpen]=useState(false),[hideDay,setHideDay]=useState(false);
 function show(){try{sessionStorage.setItem(seenKey,"1");}catch{}setOpen(true);}
 function change(next:boolean){if(!next&&hideDay){try{localStorage.setItem(hideKey,String(Date.now()+86400000));}catch{}}setOpen(next);}
 useEffect(()=>{const launch=()=>show();window.addEventListener("seon-ad-open",launch);return()=>window.removeEventListener("seon-ad-open",launch);},[]);
 useEffect(()=>{if(!active){setOpen(false);return;}try{if(sessionStorage.getItem(seenKey)||Number(localStorage.getItem(hideKey))>Date.now())return;}catch{}const timer=setTimeout(()=>{try{if(sessionStorage.getItem(seenKey))return;}catch{}show();},2200);return()=>clearTimeout(timer);},[active]);
 return <Dialog open={open} onOpenChange={change}><DialogContent className="seon-ad-popup">
  <DialogTitle>산본의 상가, 함께 찾아보세요</DialogTitle>
  <DialogDescription>선부동산 소개 영상 · 30초</DialogDescription>
  <video src="/videos/seon-ad-vertical-v2.mp4" poster="/videos/seon-ad-poster.jpg" autoPlay muted playsInline controls preload="metadata" aria-label="선부동산 소개 광고 영상"/>
  <div className="seon-ad-actions"><button onClick={()=>{change(false);onContact();}}>내 조건으로 상담 요청 ↗</button><label><input type="checkbox" checked={hideDay} onChange={e=>setHideDay(e.target.checked)}/>하루 동안 다시 보지 않기</label></div>
 </DialogContent></Dialog>;
}
