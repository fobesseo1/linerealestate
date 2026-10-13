"use client";
import Link from "next/link";
import {Suspense,useEffect,useState,type FormEvent,type ReactNode} from "react";
import {usePathname,useRouter,useSearchParams} from "next/navigation";
import {ArrowRight,Heart,Menu,Phone,Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {site} from "@/lib/site";
import {SiteMotionControl} from "./motion";
import {useSite} from "./site-context";
import {openAdEvent} from "./ad-popup";

export function SiteHeader(){
 const {favorites,openContact}=useSite();
 const router=useRouter(),pathname=usePathname();
 const [query,setQuery]=useState("");
 const [menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>setMenuOpen(false),[pathname]);
 function search(event:FormEvent){
  event.preventDefault();
  const q=query.trim();
  router.push(q?`/listings?q=${encodeURIComponent(q)}`:"/listings");
 }
 return <>
  <div className="bg-brand text-caption text-white max-md:text-tiny">
   <div className="page flex min-h-8 items-center justify-between">
    <span>군포·산본 상가 전문 <i className="mx-2 inline-block h-2 border-l border-white/60"/> 임대차부터 입점까지</span>
    <div className="flex items-center gap-4">
     <span className="max-md:text-micro">산본의 자리와 사람을 연결합니다.</span>
     <a href={site.mobileHref} className="flex items-center gap-2 max-md:hidden"><Phone size={12}/>{site.mobile}</a>
    </div>
   </div>
  </div>
  <header className="relative z-20 bg-ink text-white">
   <div className="page flex min-h-28 items-center justify-between gap-6 max-lg:gap-4 max-md:h-33 max-md:flex-wrap max-md:content-center">
    <Link href="/" aria-label="선부동산 홈" className="max-md:mr-auto"><img src="/logo-white.svg" alt="선부동산 LINE REAL ESTATE" className="h-16 w-48 object-contain max-md:h-12 max-md:w-34"/></Link>
    <form onSubmit={search} className="flex max-w-130 flex-1 items-center gap-3 rounded-sm border border-ink-line bg-ink-raised py-2 pl-5 pr-2 max-md:order-3 max-md:max-w-none max-md:basis-full max-md:py-1 max-md:pl-4">
     <Search size={20}/>
     <input aria-label="매물 검색" placeholder="어떤 점포를 찾으세요? 업종 또는 키워드" value={query} onChange={event=>setQuery(event.target.value)} className="h-8 min-w-0 flex-1 rounded-none border-0 bg-transparent text-body text-white outline-none placeholder:text-gray-400 max-md:h-7 max-md:text-base"/>
     <button aria-label="검색" type="submit" className="grid size-8 place-items-center rounded-full bg-ink"><ArrowRight size={19}/></button>
    </form>
    <div className="flex items-center gap-5 max-md:hidden">
     <Link href="/listings?saved=1" className="flex items-center gap-2 text-xs max-lg:hidden"><Heart size={18}/>찜한 매물 <b className="text-caption text-brand">{favorites.length}</b></Link>
     <Button onClick={()=>openContact()}>상담 요청</Button>
    </div>
    <button aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)} className="md:hidden"><Menu/></button>
   </div>
   <SiteMotionControl/>
   <nav className="border-y border-white/12">
    <div className={cn("page flex min-h-14 flex-wrap items-center gap-x-8 max-lg:gap-x-5 max-md:gap-x-4",menuOpen?"max-md:grid max-md:grid-cols-2 max-md:py-2":"max-md:flex-nowrap max-md:overflow-x-auto max-md:[scrollbar-width:none]")}>
     <Suspense fallback={<NavLinks type={null} pathname={pathname}/>}><NavLinksWithQuery pathname={pathname}/></Suspense>
     <button className={item(false,"text-brand-pale")} onClick={()=>window.dispatchEvent(new Event(openAdEvent))}>광고 영상</button>
     <Link className={item(false,"text-xs")} href="/listings?saved=1">찜한 매물 {favorites.length}</Link>
     <button className={item(false,cn("ml-auto gap-2 text-xs",menuOpen?"max-md:ml-0":"max-md:hidden"))} onClick={()=>openContact({kind:"landlord",goal:"내 점포 임대 의뢰"})}>내 점포 내놓기 <ArrowRight size={14}/></button>
    </div>
   </nav>
  </header>
 </>;
}

const item=(active:boolean,className?:string)=>cn(
 "relative flex items-center whitespace-nowrap py-4 text-sm font-semibold max-lg:text-xs max-md:py-3.5 max-md:text-caption",
 active&&"text-brand-soft after:absolute after:inset-x-0 after:-bottom-px after:h-1 after:bg-brand",
 className,
);

function NavLinksWithQuery({pathname}:{pathname:string}){
 return <NavLinks type={useSearchParams().get("type")} pathname={pathname}/>;
}

function NavLinks({type,pathname}:{type:string|null;pathname:string}){
 const listings=pathname==="/listings";
 const links:[string,string,boolean][]=[
  ["/","홈",pathname==="/"],
  ["/listings?type=lease","상가 임대차",listings&&type!=="sale"],
  ["/listings?type=sale","상가 매매",listings&&type==="sale"],
  ["/works","중개 완료 사례",pathname.startsWith("/works")],
  ["/compare","점포 비용 비교",pathname==="/compare"],
  ["/process","상담·계약 과정",pathname==="/process"],
 ];
 return <>{links.map(([href,label,active]):ReactNode=><Link key={href} href={href} className={item(active)} aria-current={active?"page":undefined}>{label}</Link>)}</>;
}
