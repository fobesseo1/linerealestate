"use client";
import Link from "next/link";
import {useEffect,useState,type CSSProperties,type ReactNode} from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,Building2,MapPin,Phone} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useSite} from "@/components/site/site-context";
import {useSiteMotion} from "@/components/site/motion";
import {usePublications} from "@/lib/content/use-publications";
import {kindLabel,type DealRecord,type Publication} from "@/lib/content/types";
import {detailHref,isGroundFloor,noPremium,placeLabel,price} from "@/lib/content/format";
import {CompactListingCard} from "@/components/listings/listing-card";
import {site} from "@/lib/site";
import {cn} from "@/lib/utils";
import {Companion} from "./companion";
import {RecordMarquee} from "./record-marquee";

/** A-1 home: hero with rotating featured listing, condition shortcuts, ticker, newest listings, cases and record. Stays the same height as listings grow. */
export function HomePage({initial,records,since}:{initial:Publication[]|null;records:DealRecord[];since:string}){
 const {items,failed}=usePublications(initial);
 const {openContact,favorites,toggleFavorite}=useSite();
 const moving=useSiteMotion();
 const [slide,setSlide]=useState(0);
 const listings=items.filter(item=>item.content.kind!=="work"&&item.status==="active");
 const works=items.filter(item=>item.content.kind==="work");
 const featured=listings[slide%Math.max(listings.length,1)];
 const lease=listings.filter(i=>i.content.kind==="lease");
 // Each shortcut opens the listings page with the same filter applied.
 const shortcuts:[string,number,string][]=[
  ["전체 매물",listings.length,"/listings"],
  ["상가 임대",lease.length,"/listings?type=lease"],
  ["상가 매매",listings.filter(i=>i.content.kind==="sale").length,"/listings?type=sale"],
  ["1층 매물",listings.filter(i=>isGroundFloor(i.content)).length,"/listings?floor=1"],
  ["무권리",listings.filter(i=>noPremium(i.content)).length,"/listings?premium=0"],
  ["월세 150만원 이하",lease.filter(i=>i.content.rent!==""&&Number(i.content.rent)<=150).length,"/listings?type=lease&rent=150"],
 ];
 useEffect(()=>{
  if(!moving||listings.length<2)return;
  const timer=setInterval(()=>{if(!document.hidden)setSlide(s=>(s+1)%listings.length);},1800);
  return()=>clearInterval(timer);
 },[moving,listings.length]);

 return <div className="min-h-screen bg-background text-ink">
  <div className="flex items-center gap-4 bg-brand px-gutter py-3 text-white">
   <span className="whitespace-nowrap border border-white/40 px-2 py-1 text-caption font-bold">산본 상가 전문</span>
   <p className="flex-1 text-xs max-md:text-caption max-md:leading-normal">매물 조건부터 입점 협의까지, 김영선 공인중개사가 함께합니다.</p>
   <a href="#properties" className="flex items-center gap-2 text-caption max-md:hidden">매물 확인 <ArrowUpRight size={14}/></a>
  </div>

  <section data-section="home" aria-label="첫 화면" className="relative grid grid-cols-[.9fr_1.1fr] items-center gap-[5%] overflow-hidden bg-ink px-gutter pb-14 pt-11 text-white before:pointer-events-none before:absolute before:bottom-5 before:left-0 before:text-[clamp(150px,22vw,350px)] before:font-black before:leading-none before:tracking-[-12px] before:text-white/[0.025] before:content-['SANBON'] max-md:grid-cols-1 max-md:gap-9 max-md:py-9">
   <div className="relative z-2">
    <Eyebrow>SANBON, YOUR NEXT PLACE</Eyebrow>
    <h1 className="text-[clamp(40px,4.5vw,72px)] font-heavy leading-[1.15] tracking-[-3px] max-md:text-[46px]">산본의 상가,<br/><em className="not-italic text-brand">지금 만나보세요.</em></h1>
    <p className="my-6 text-sm leading-[1.85] text-gray-400 max-md:my-5 max-md:text-body">상가 임대부터 매매, 입점 조건 협의까지.<br/>사진과 조건을 보고, 현장에서 함께 확인하세요.</p>
    <a href="#properties" className="relative inline-flex animate-nudge items-center gap-6 overflow-hidden bg-brand px-6 py-4 text-sm font-demibold text-white after:pointer-events-none after:absolute after:-inset-x-[40%] after:-inset-y-[80%] after:-translate-x-4/5 after:animate-shine after:bg-[linear-gradient(100deg,transparent_42%,#ffffff55_50%,transparent_58%)] after:content-['']">지금 등록된 상가 보기 <ArrowUpRight size={20}/></a>
    <div className="mt-9 flex gap-6 max-md:mt-6 max-md:gap-8">
     {[[listings.length,"공개 중인 매물"],[since?`${since}~`:works.length,since?"산본 입점 중개":"등록된 중개 사례"],["산본","상가 전문"]].map(([value,label])=><span key={label} className="flex flex-col gap-2 text-tiny text-gray-600"><b className="text-2xl font-semibold text-white">{value}</b>{label}</span>)}
    </div>
   </div>
   {featured?<Featured item={featured} count={listings.length} index={slide%listings.length} onMove={step=>setSlide(s=>(s+step+listings.length)%listings.length)}/>
    :<div role="status" className="rounded-sm bg-ink-raised px-8 py-24 text-center text-gray-400">{failed?"매물을 불러오지 못했습니다. 새로고침해 주세요.":"공개 중인 매물이 없습니다."}</div>}
   <nav aria-label="조건별 매물 바로가기" className="relative z-1 col-span-full mt-4 grid grid-cols-6 gap-3 max-lg:grid-cols-3 max-md:mt-0 max-md:gap-2">
    {shortcuts.map(([label,count,href],i)=><Link key={label} href={href} className={cn("group relative flex flex-col gap-1 border border-ink-line bg-ink-raised p-4 text-white transition-colors hover:border-brand max-md:p-3",i===0&&"border-l-4 border-l-brand")}>
     <span className="text-xs text-gray-400 max-md:text-caption">{label}</span>
     <b className="text-2xl font-heavy max-md:text-xl">{count}<small className="ml-1 text-xs font-normal text-gray-400">개</small></b>
     <ArrowUpRight size={16} className="absolute right-3 top-3 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
    </Link>)}
   </nav>
  </section>

  {listings.length>0&&<div aria-label="등록된 매물 요약" className="overflow-hidden border-y-2 border-white bg-brand py-4 text-white max-md:py-2">
   <div className="flex w-max animate-ticker hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]" style={{"--ticker-duration":`${listings.length*9}s`} as CSSProperties}>
    {[0,1,2].map(copy=><span key={copy} aria-hidden={copy>0||undefined} className="flex shrink-0 gap-4 pr-4">
     {listings.map(item=><Link key={item.id} href={detailHref(item)} tabIndex={copy>0?-1:undefined} className="group/item flex items-center gap-4 whitespace-nowrap rounded-sm px-3 py-1 text-sm font-demibold transition-colors hover:bg-white hover:text-brand focus-visible:bg-white focus-visible:text-brand max-md:text-xs">
      <b className="border border-white/45 p-1 text-tiny group-hover/item:border-brand group-focus-visible/item:border-brand">{item.number}</b>{item.content.title}
      <ArrowUpRight size={22} className="transition-transform group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5"/>
     </Link>)}
    </span>)}
   </div>
  </div>}

  <Companion moving={moving} failed={failed} count={listings.length} onContact={()=>openContact()}/>

  <HomeSection id="properties" section="properties" eyebrow="PLACES AVAILABLE" title="지금, 산본의 자리" description="김영선 공인중개사가 확인하고 올린 최신 매물입니다." more={["/listings",`전체 매물 ${listings.length}개 보기`]}>
   <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-md:gap-3">
    {listings.slice(0,8).map(item=><CompactListingCard key={item.id} item={item} saved={favorites.includes(item.number)} onFavorite={toggleFavorite}/>)}
   </div>
  </HomeSection>

  <HomeSection section="works" divider eyebrow="STORIES IN SANBON" title="계약 너머, 오픈까지" description="조건 협의부터 오픈까지 함께한 중개 이야기입니다." more={["/works","중개 사례 전체 보기"]}>
   <div className="grid grid-cols-4 gap-6 max-lg:gap-4 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6">
    {works.slice(0,4).map((item,i)=><Link key={item.id} href={detailHref(item)} data-companion-title={item.content.title} className="group">
     <div className="relative h-45 overflow-hidden rounded-md max-md:h-36"><Photo item={item} className="transition-transform duration-600 group-hover:scale-106"/><span className="absolute bottom-3 left-3 bg-black/65 px-2 py-1 text-micro text-white">중개 완료 사례</span></div>
     <small className="mt-4 block text-tiny text-gray-500">0{i+1} / {item.content.industry||"입점 이야기"}</small>
     <h3 className="my-2 flex justify-between gap-2 text-lead font-demibold max-md:text-md">{item.content.title}<ArrowUpRight size={20}/></h3>
     <p className="text-xs leading-[1.7] text-gray-500 max-md:text-caption">{item.content.description.slice(0,85)}</p>
    </Link>)}
   </div>
  </HomeSection>

  {records.length>0&&<HomeSection section="records" divider eyebrow="STORES WE OPENED" title="산본 입점 기록" description={`${since}년부터 함께한 매장 가운데 일부입니다. 매장을 누르면 네이버 플레이스가 열립니다.`} more={["/works#records","입점 기록 전체 보기"]}>
   <RecordMarquee records={records}/>
  </HomeSection>}

  <section data-section="service" aria-label="상담 안내" className="px-gutter pb-16 max-md:pb-10">
   <div className="flex items-center justify-between gap-8 border border-t-4 border-gray-200 border-t-brand bg-white px-10 py-9 max-lg:flex-wrap max-md:gap-5 max-md:px-6 max-md:py-7">
    <div><Eyebrow>A LOCAL PARTNER</Eyebrow><h2 className="text-[28px] font-heavy leading-[1.35] max-md:text-2xl">조건을 듣고,<br/>대안을 함께 찾습니다.</h2></div>
    <p className="text-sm leading-[1.9] text-gray-700 max-lg:flex-1 max-md:flex-none max-md:text-body">희망 업종과 예산이 아직 정리되지 않아도 괜찮습니다.<br/>임대료와 시설, 입점 전 협의할 조건부터 이야기해 주세요.</p>
    <div className="flex shrink-0 gap-3 max-md:w-full">
     <Button asChild variant="outline" className="h-12 rounded-sm border-2 border-brand bg-white px-5 text-sm font-bold text-brand hover:bg-brand-tint max-md:flex-1"><a href={site.mobileHref}><Phone size={17}/>{site.mobile}</a></Button>
     <Button onClick={()=>openContact()} className="h-12 rounded-sm px-6 text-sm font-bold max-md:flex-1">상담 요청 <ArrowRight size={16}/></Button>
    </div>
   </div>
  </section>
 </div>;
}

function Featured({item,count,index,onMove}:{item:Publication;count:number;index:number;onMove:(step:number)=>void}){
 const href=detailHref(item);
 return <div className="relative min-w-0 overflow-hidden border-2 border-brand bg-white text-ink shadow-[8px_8px_0_#e00b4130] max-md:mr-2">
  <div key={item.id} className="relative aspect-[1.9/1] animate-swipe overflow-hidden max-md:aspect-[1.65/1]">
   <Photo item={item} className="absolute inset-0 animate-punch"/>
   <Badge className="absolute left-5 top-5 px-3 py-2 font-demibold">{kindLabel[item.content.kind]} · {item.number}</Badge>
   <Link href={href} className="absolute inset-0" aria-label={`${item.content.title} 상세 보기`}/>
  </div>
  <div key={`info-${item.id}`} className="animate-hit px-5 pb-3 pt-3 max-md:px-4">
   <span className="flex items-center gap-1 text-caption text-gray-600"><MapPin size={14}/>{placeLabel(item.content)}</span>
   <h2 className="mb-2 mt-3 text-[21px] leading-[1.4] tracking-[-0.6px] max-md:mt-2 max-md:text-lead"><Link href={href}>{item.content.title}</Link></h2>
   <Money item={item} className="my-2" size="text-[22px] max-md:text-lg"/>
   <div className="mt-2 flex items-center justify-between pt-2">
    <Link href={href} className="flex items-center gap-2 text-xs">매물 자세히 <ArrowUpRight size={16}/></Link>
    <div className="flex items-center gap-3">
     <button aria-label="이전 매물" disabled={count<2} onClick={()=>onMove(-1)} className="grid size-8 place-items-center rounded-full border border-gray-200 disabled:opacity-35"><ArrowLeft size={18}/></button>
     <span className="text-tiny text-gray-500">{index+1} / {count}</span>
     <button aria-label="다음 매물" disabled={count<2} onClick={()=>onMove(1)} className="grid size-8 place-items-center rounded-full border border-gray-200 disabled:opacity-35"><ArrowRight size={18}/></button>
    </div>
   </div>
  </div>
 </div>;
}

function Money({item,size,className}:{item:Publication;size:string;className?:string}){
 const c=item.content,value=cn("font-strong tracking-[-0.5px] text-brand",size),label="text-tiny text-gray-500 max-md:text-micro";
 return <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1",className)}>
  {c.kind==="sale"?<><span className={label}>매매가</span><strong className={value}>{price(c.salePrice)}</strong></>
   :<><span className={label}>보증금</span><strong className={value}>{price(c.deposit)}</strong><i className="mx-1 not-italic text-gray-200">/</i><span className={label}>월세</span><strong className={value}>{price(c.rent)}</strong></>}
 </div>;
}

function Photo({item,className}:{item:Publication;className?:string}){
 const url=item.content.photos[0]?.url;
 return url?<img src={url} alt={item.content.title} className={cn("size-full object-cover",className)}/>
  :<div className="flex size-full items-center justify-center gap-3 bg-gray-100 text-xs text-gray-500"><Building2/><span>사진 준비 중</span></div>;
}

function Eyebrow({children,className}:{children:ReactNode;className?:string}){
 return <span className={cn("mb-4 block animate-tracking text-tiny font-bold tracking-[2px] text-brand",className)}>{children}</span>;
}

/** Shared frame for home content sections: same spacing, divider, heading row and "see all" button. */
function HomeSection({id,section,divider=false,eyebrow,title,description,more,children}:{id?:string;section:string;divider?:boolean;eyebrow:string;title:string;description:string;more:[string,string];children:ReactNode}){
 const [href,label]=more;
 return <section id={id} data-section={section} className="scroll-mt-22 px-gutter">
  <div className={cn("py-16 max-md:py-10",divider&&"border-t-2 border-ink")}>
   <div className="mb-8 max-md:mb-6">
    <Eyebrow>{eyebrow}</Eyebrow>
    <div className="flex items-baseline justify-between gap-4">
     <h2 className="text-[33px] font-heavy leading-tight tracking-[-1px] max-md:text-[28px]">{title}</h2>
     <Link href={href} className="flex shrink-0 items-center gap-2 text-xs hover:text-brand max-md:hidden">{label} <ArrowUpRight size={16}/></Link>
    </div>
    <p className="mt-2 text-sm text-gray-700 max-md:text-body">{description}</p>
   </div>
   {children}
   <div className="mt-10 flex justify-center max-md:mt-8"><Button asChild variant="outline" className="h-12 rounded-sm border-2 border-ink bg-white px-8 text-sm font-bold hover:bg-ink hover:text-white"><Link href={href}>{label} <ArrowRight size={16}/></Link></Button></div>
  </div>
 </section>;
}
