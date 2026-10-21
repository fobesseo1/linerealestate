"use client";
import Link from "next/link";
import {useEffect,type ReactNode} from "react";
import {usePathname,useRouter} from "next/navigation";
import {ArrowRight,ChevronUp,Heart,Phone} from "lucide-react";
import {Button} from "@/components/ui/button";
import legacyWorkRoutes from "@/lib/content/legacy-work-routes.json";
import {site} from "@/lib/site";
import {SiteProvider,useSite} from "./site-context";
import {SiteHeader} from "./site-header";
import {ContactDialog} from "./contact-dialog";
import {AdPopup} from "./ad-popup";

/** Header, footer and shared dialogs for every public page. The admin screens use their own layout. */
export function SiteShell({children}:{children:ReactNode}){
 return <SiteProvider>
  <div className="seon-site min-h-screen bg-background text-foreground max-md:pb-[calc(68px+env(safe-area-inset-bottom))]">
   <LegacyHashRedirect/>
   <SiteHeader/>
   <main className="min-h-[55vh]">{children}</main>
   <SiteFooter/>
   <MobileInquiryBar/>
   <FloatingTools/>
   <ShellDialogs/>
  </div>
 </SiteProvider>;
}

function ShellDialogs(){
 const {contact,openContact}=useSite();
 const home=usePathname()==="/";
 return <>
  <ContactDialog/>
  <AdPopup active={home&&!contact} onContact={()=>openContact()}/>
 </>;
}

function SiteFooter(){
 return <footer className="bg-ink py-9 text-white">
  <div className="page flex items-center gap-9 border-b border-white/12 pb-6 max-md:flex-wrap max-md:gap-5">
   <img src="/logo-white.svg" alt="선부동산" className="h-12 w-44 object-contain opacity-85 max-md:w-30"/>
   <div className="flex flex-col gap-2 max-md:min-w-40 max-md:flex-1"><strong className="text-xs font-medium">산본의 자리와 사람을 연결합니다.</strong><span className="text-tiny text-gray-400">상가 임대차 · 상가 매매 · 입점 조건 협의</span></div>
   <a href={site.mobileHref} className="ml-auto flex items-center gap-3 text-[22px] font-demibold max-md:ml-0 max-md:text-xl">{site.mobile}<Phone size={18}/></a>
  </div>
  <div className="page flex justify-between pt-6 text-tiny leading-loose text-gray-400 max-md:flex-col max-md:gap-4 max-md:leading-[1.9]">
   <p>선 공인중개사 · 공인중개사 {site.agent}<br/>{site.address}<br/>사무실 {site.office} · 이메일 {site.email}</p>
   <p className="text-right max-md:text-left"><a href="/admin/">관리자</a><br/>LINE REAL ESTATE<br/>점포 비용 비교는 가정에 따른 예시입니다.<br/>실제 중개 사례의 금액은 거래 당시 조건입니다.</p>
  </div>
 </footer>;
}

function MobileInquiryBar(){
 const {openContact,pageInquiry}=useSite();
 return <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink-line bg-ink px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] text-white backdrop-blur-sm md:hidden">
  <a href={site.mobileHref} aria-label="김영선 공인중개사에게 전화하기" className="flex h-11 w-18 items-center justify-center gap-2 rounded-lg border border-gray-800 text-xs"><Phone size={18}/><span>전화</span></a>
  <Button onClick={()=>openContact()} className="h-11 flex-1 text-body">{pageInquiry?"이 자료 상담 요청":"내 조건으로 문의하기"}<ArrowRight size={16}/></Button>
 </div>;
}

/** Side tools live in the margin beside the 1440px column, so they only appear on very wide screens. */
function FloatingTools(){
 const {favorites,openContact}=useSite();
 if(usePathname()==="/")return null;
 const tool="flex w-full flex-col items-center gap-2 border-b border-gray-200 px-1 py-4 text-tiny";
 return <aside className="fixed right-[max(16px,calc((100vw-1440px)/2-110px))] top-75 z-25 hidden w-18 overflow-hidden rounded-lg border border-gray-200 bg-white text-ink shadow-[0_5px_20px_#0001] 2xl:block">
  <Link href="/listings?saved=1" className={tool}><Heart size={18}/><span>찜한 매물</span><b className="text-tiny text-brand">{favorites.length}</b></Link>
  <button onClick={()=>openContact()} className={tool}><Phone size={18}/><span>상담 요청</span></button>
  <button aria-label="맨 위로" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="flex w-full flex-col items-center gap-2 p-3 text-tiny"><ChevronUp size={18}/><span>TOP</span></button>
 </aside>;
}

/** Links shared before real page addresses (/#listings, /#property/SUN-1012, /#work/salon …) keep working. */
function LegacyHashRedirect(){
 const router=useRouter(),pathname=usePathname();
 useEffect(()=>{
  if(pathname!=="/")return;
  const redirect=()=>{
   const [section,id]=decodeURIComponent(window.location.hash.slice(1)).split("/");
   const works=legacyWorkRoutes as Record<string,string>;
   const target=
    section==="home"?"/":
    section==="listings"||section==="case"?"/listings":
    section==="sales"?"/listings?type=sale":
    ["works","compare","process"].includes(section)&&!id?`/${section}`:
    section==="property"&&id?`/property/${id}`:
    section==="work"?(works[id]?`/works/${works[id]}`:"/works"):
    null;
   if(target)router.replace(target);
  };
  redirect();
  window.addEventListener("hashchange",redirect);
  return()=>window.removeEventListener("hashchange",redirect);
 },[pathname,router]);
 return null;
}
