"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {InquiryContext} from "@/components/inquiry/inquiry-form";

const favoritesKey="sun-favorites";

type SiteState={
 favorites:string[];
 toggleFavorite:(number:string)=>void;
 /** Opens the contact dialog; without a context it uses the current page's listing or case. */
 openContact:(context?:InquiryContext)=>void;
 contact:InquiryContext|null;
 closeContact:()=>void;
 pageInquiry:InquiryContext|null;
 setPageInquiry:(context:InquiryContext|null)=>void;
};

const SiteContext=createContext<SiteState|null>(null);

export function SiteProvider({children}:{children:ReactNode}){
 const [favorites,setFavorites]=useState<string[]>([]);
 const [contact,setContact]=useState<InquiryContext|null>(null);
 const [pageInquiry,setPageInquiry]=useState<InquiryContext|null>(null);
 useEffect(()=>{
  // Earlier demo builds saved virtual listing ids; only SUN numbers are real listings.
  try{setFavorites((JSON.parse(localStorage.getItem(favoritesKey)||"[]") as string[]).filter(id=>id.startsWith("SUN-")));}catch{/* Ignore unreadable preferences. */}
 },[]);
 const toggleFavorite=useCallback((number:string)=>setFavorites(previous=>{
  const next=previous.includes(number)?previous.filter(x=>x!==number):[...previous,number];
  try{localStorage.setItem(favoritesKey,JSON.stringify(next));}catch{/* Favorites stay for this visit. */}
  return next;
 }),[]);
 const openContact=useCallback((context?:InquiryContext)=>setContact(context||pageInquiry||{kind:"general",goal:"상가 임대차 후보 비교"}),[pageInquiry]);
 const value=useMemo(()=>({favorites,toggleFavorite,openContact,contact,closeContact:()=>setContact(null),pageInquiry,setPageInquiry}),[favorites,toggleFavorite,openContact,contact,pageInquiry]);
 return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(){
 const value=useContext(SiteContext);
 if(!value)throw Error("useSite must be used inside SiteProvider");
 return value;
}

/** Detail pages register their listing or case so header, mobile bar and dialog ask about it. */
export function usePageInquiry(context:InquiryContext){
 const {setPageInquiry}=useSite();
 const {kind,title,reference,goal}=context;
 useEffect(()=>{setPageInquiry({kind,title,reference,goal});return()=>setPageInquiry(null);},[setPageInquiry,kind,title,reference,goal]);
}
