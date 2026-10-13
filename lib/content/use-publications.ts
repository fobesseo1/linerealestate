"use client";
import {useEffect,useState} from "react";
import {contentClient} from "./client";
import type {Publication} from "./types";

/** Starts from the server-rendered list and keeps it current while the page is open. */
export function usePublications(initial:Publication[]|null){
 const [items,setItems]=useState<Publication[]>(initial||[]);
 const [failed,setFailed]=useState(initial===null);
 useEffect(()=>{
  let live=true;
  async function refresh(){
   const db=contentClient();if(!db)return;
   const {data,error}=await db.from("lineestate_published").select("*").in("status",["active","completed"]).order("published_at",{ascending:false});
   if(!live)return;
   if(error)setFailed(true);else{setItems(data||[]);setFailed(false);}
  }
  const timer=setInterval(()=>{if(!document.hidden)refresh();},10000);
  const visible=()=>{if(!document.hidden)refresh();};
  window.addEventListener("focus",refresh);window.addEventListener("lineestate-published",refresh);document.addEventListener("visibilitychange",visible);
  return()=>{live=false;clearInterval(timer);window.removeEventListener("focus",refresh);window.removeEventListener("lineestate-published",refresh);document.removeEventListener("visibilitychange",visible);};
 },[]);
 return {items,failed};
}
