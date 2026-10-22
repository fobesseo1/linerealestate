"use client";
import Link from "next/link";
import {useEffect,useState,type ReactNode} from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,Building2,Check,MapPin,Phone,Search} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useSite} from "@/components/site/site-context";
import {useSiteMotion} from "@/components/site/motion";
import {usePublications} from "@/lib/content/use-publications";
import {kindLabel,type Publication} from "@/lib/content/types";
import {detailHref,floorLabel,placeLabel,price,pyeong} from "@/lib/content/format";
import {site} from "@/lib/site";
import {cn} from "@/lib/utils";
import {Companion} from "./companion";

const categories=["전체","상가 임대","상가 매매"] as const;

/** A-1 home: hero with rotating featured listing, listing strip and ticker, searchable cards, cases. */
export function HomePage({initial,records}:{initial:Publication[]|null;records:{count:number;since:string}}){
 const {items,failed}=usePublications(initial);
 const {openContact}=useSite();
 const moving=useSiteMotion();
 const [slide,setSlide]=useState(0);
 const [category,setCategory]=useState<(typeof categories)[number]>("전체");
 const [query,setQuery]=useState("");
 const listings=items.filter(item=>item.content.kind!=="work"&&item.status==="active");
 const works=items.filter(item=>item.content.kind==="work");
 const featured=listings[slide%Math.max(listings.length,1)];
 const shown=listings.filter(({content:c})=>(category==="전체"||(category==="상가 매매"?c.kind==="sale":c.kind==="lease"))&&(!query||`${c.title} ${c.industry} ${c.showMap?c.address:""}`.includes(query)));
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
     {[[listings.length,"공개 중인 매물"],[records.since?`${records.since}~`:works.length,records.since?"산본 입점 중개":"등록된 중개 사례"],["산본","상가 전문"]].map(([value,label])=><span key={label} className="flex flex-col gap-2 text-tiny text-gray-600"><b className="text-2xl font-semibold text-white">{value}</b>{label}</span>)}
    </div>
   </div>
   {featured?<Featured item={featured} count={listings.length} index={slide%listings.length} onMove={step=>setSlide(s=>(s+step+listings.length)%listings.length)}/>
    :<div role="status" className="rounded-sm bg-ink-raised px-8 py-24 text-center text-gray-400">{failed?"매물을 불러오지 못했습니다. 새로고침해 주세요.":"공개 중인 매물이 없습니다."}</div>}
   <div className="relative z-1 col-span-full mt-4 grid grid-cols-3 gap-3 max-md:mt-0 max-md:grid-cols-1 max-md:gap-2">
    {listings.map(item=><Link key={item.id} href={detailHref(item)} className="relative border border-l-4 border-ink-line bg-ink-raised p-5 text-white max-md:p-4">
     <span className="text-tiny font-bold text-brand-soft">{floorLabel(item.content)||kindLabel[item.content.kind]}</span>
     <strong className="my-2 block pr-3 text-body leading-[1.7] max-md:my-1">{item.content.title}</strong>
     <small className="text-caption text-gray-400">{item.content.kind==="sale"?`매매 ${price(item.content.salePrice)}`:`월세 ${price(item.content.rent)}`}</small>
     <ArrowUpRight size={18} className="absolute bottom-5 right-4 text-brand"/>
    </Link>)}
   </div>
  </section>

  {listings.length>0&&<div aria-label="등록된 매물 요약" className="overflow-hidden border-y-2 border-white bg-brand py-5 text-white max-md:py-3">
   <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
    {[0,1,2].map(copy=><span key={copy} aria-hidden={copy>0} className="flex shrink-0 gap-10 pr-10">
     {listings.map(item=><span key={item.id} className="flex items-center gap-4 whitespace-nowrap text-sm font-demibold max-md:text-xs"><b className="border border-white/45 p-1 text-tiny">{item.number}</b>{item.content.title}<i className="text-2xl not-italic">↗</i></span>)}
    </span>)}
   </div>
  </div>}

  <Companion moving={moving} failed={failed} count={shown.length} onContact={()=>openContact()}/>

  <section id="properties" data-section="properties" className="scroll-mt-22 px-gutter pb-16 pt-14 max-md:py-10">
   <SectionTitle eyebrow="PLACES AVAILABLE" title="지금, 산본의 자리"><p className="mb-1 text-xs text-gray-500">등록된 실제 매물의 사진과 조건을 비교해 보세요.</p></SectionTitle>
   <div className="mb-7 flex justify-between gap-4 max-md:flex-wrap">
    <div className="flex gap-2">{categories.map(label=><Button key={label} variant="outline" aria-pressed={category===label} onClick={()=>setCategory(label)} className="rounded-full border-gray-200 bg-transparent text-xs aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white">{label}{category===label&&<Check size={14}/>}</Button>)}</div>
    <label className="flex items-center gap-2 border-b border-gray-200 text-gray-500 max-md:w-full"><Search size={18}/><input aria-label="매물명·주소 검색" value={query} onChange={event=>setQuery(event.target.value)} placeholder="매물명·주소로 찾기" className="h-10 w-48 rounded-none border-0 bg-transparent text-xs text-ink outline-none max-md:w-full max-md:text-base"/></label>
   </div>
   <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
    {shown.map((item,index)=><HomeCard key={item.id} item={item} index={index}/>)}
   </div>
   {!shown.length&&<p className="p-6 text-sm text-gray-700">조건에 맞는 매물이 없습니다. 다른 검색어로 찾아보세요.</p>}
  </section>

  <section data-section="service" className="mx-gutter flex items-center justify-between gap-8 bg-brand px-[5%] py-11 text-white shadow-[8px_8px_0_var(--color-ink)] max-lg:flex-wrap max-md:mr-[calc(5vw+8px)] max-md:gap-6 max-md:px-[7%] max-md:py-8">
   <div><Eyebrow className="text-white/75">A LOCAL PARTNER</Eyebrow><h2 className="text-[28px] font-medium leading-[1.35] tracking-[-1px] max-md:text-[25px]">조건을 듣고,<br/>대안을 함께 찾습니다.</h2></div>
   <p className="text-xs leading-[1.9] text-white/75 max-lg:flex-1 max-md:flex-none">희망 업종과 예산이 아직 정리되지 않아도 괜찮습니다.<br/>임대료와 시설, 입점 전 협의할 조건부터 이야기해 주세요.</p>
   <a href={site.mobileHref} className="flex items-center gap-3 whitespace-nowrap text-base"><Phone size={19}/>{site.mobile} <ArrowUpRight size={18}/></a>
  </section>

  <section data-section="works" className="scroll-mt-22 px-gutter pb-16 pt-14 max-md:py-10">
   <SectionTitle eyebrow="STORIES IN SANBON" title="계약 너머, 오픈까지"><Link href="/works" className="flex items-center gap-3 text-xs">중개 사례 전체 보기 <ArrowUpRight size={18}/></Link></SectionTitle>
   {records.count>0&&<Link href="/works#records" className="-mt-2 mb-6 flex w-fit items-center gap-2 text-sm text-gray-800 hover:text-brand"><b className="font-heavy text-brand">{records.since}년부터</b> 산본 곳곳의 입점을 함께했습니다 · 입점 기록 보기 <ArrowUpRight size={16}/></Link>}
   <div className="grid grid-cols-4 gap-6 max-lg:gap-4 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6">
    {works.slice(0,4).map((item,i)=><Link key={item.id} href={detailHref(item)} data-companion-title={item.content.title} className="group">
     <div className="relative h-45 overflow-hidden rounded-md max-md:h-36"><Photo item={item} className="transition-transform duration-600 group-hover:scale-106"/><span className="absolute bottom-3 left-3 bg-black/65 px-2 py-1 text-micro text-white">중개 완료 사례</span></div>
     <small className="mt-4 block text-tiny text-gray-500">0{i+1} / {item.content.industry||"입점 이야기"}</small>
     <h3 className="my-2 flex justify-between gap-2 text-lead font-demibold max-md:text-md">{item.content.title}<ArrowUpRight size={20}/></h3>
     <p className="text-xs leading-[1.7] text-gray-500 max-md:text-caption">{item.content.description.slice(0,85)}</p>
    </Link>)}
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

function HomeCard({item,index}:{item:Publication;index:number}){
 const c=item.content,href=detailHref(item);
 return <article data-companion-title={c.title} style={{animationDelay:`${index*55}ms`}} className="group overflow-hidden border-2 border-ink bg-white animate-rise transition-[translate,box-shadow] duration-200 hover:-translate-y-2 hover:shadow-[8px_8px_0_var(--color-brand)] max-md:grid max-md:grid-cols-[.8fr_1.2fr]">
  <Link href={href} className="relative block h-58 overflow-hidden max-md:h-full max-md:min-h-56">
   <Photo item={item} className="transition-transform duration-200 group-hover:scale-114"/>
   <Badge className="absolute left-4 top-4">{kindLabel[c.kind]}</Badge>
   <b className="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={22}/></b>
  </Link>
  <div className="p-6 max-md:p-4">
   <small className="text-tiny text-gray-500">{item.number} · {floorLabel(c)||"층 미확인"}{c.area?` · 약 ${pyeong(c.area)}평`:""}</small>
   <h3 className="mb-4 mt-2 min-h-14 text-lg font-extrabold leading-normal tracking-[-0.6px] max-md:min-h-0 max-md:text-md"><Link href={href}>{c.title}</Link></h3>
   <Money item={item} size="text-[22px] max-md:text-base"/>
   <p className="mt-4 line-clamp-2 min-h-11 text-xs leading-[1.8] text-gray-500 max-md:text-caption">{c.description.slice(0,95)}</p>
   <Link href={href} className="mt-5 flex justify-between border-t border-gray-100 pt-4 text-caption">사진·조건 살펴보기 <ArrowUpRight size={16}/></Link>
  </div>
 </article>;
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

function SectionTitle({eyebrow,title,children}:{eyebrow:string;title:string;children:ReactNode}){
 return <div className="mb-6 flex items-end justify-between gap-5 max-md:flex-col max-md:items-start max-md:gap-3">
  <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="text-[33px] font-heavy tracking-[-1px]">{title}</h2></div>
  {children}
 </div>;
}
