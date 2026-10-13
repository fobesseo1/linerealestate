"use client";
import Link from "next/link";
import type {ReactNode} from "react";
import {ArrowRight,ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useSite} from "./site-context";

/** Dark title band with a red rule, shared by the information pages. */
export function EditorialHeading({eyebrow,title,children}:{eyebrow:string;title:ReactNode;children:ReactNode}){
 return <div className="mb-8 border-b-4 border-brand bg-ink p-11 text-white max-md:px-6 max-md:py-7">
  <span className="inline-block text-tiny font-demibold tracking-[.12em] text-brand">{eyebrow}</span>
  <h1 className="my-3 text-[clamp(28px,3.4vw,48px)] font-heavy leading-[1.35] tracking-[-0.05em]">{title}</h1>
  <p className="max-w-185 text-sm leading-[1.8] text-gray-400 max-md:text-body">{children}</p>
 </div>;
}

export function Breadcrumb({children}:{children:ReactNode}){
 return <nav aria-label="현재 위치" className="my-6 flex items-center gap-2 text-xs text-gray-700"><Link href="/">홈</Link><ChevronRight size={12}/>{children}</nav>;
}

export function ContactButton({children,className}:{children:ReactNode;className?:string}){
 const {openContact}=useSite();
 return <Button onClick={()=>openContact()} className={className}>{children} <ArrowRight size={16}/></Button>;
}
