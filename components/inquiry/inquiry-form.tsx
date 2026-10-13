"use client";

import {useId,useRef,useState,type FormEvent} from "react";
import {ArrowRight,Clock,Phone} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input,Textarea} from "@/components/ui/input";
import {NativeSelect} from "@/components/ui/native-select";
import {Character} from "./character";
import {useSiteMotion} from "@/components/site/motion";
import {cn} from "@/lib/utils";

export type InquiryContext={kind:"general"|"listing"|"work"|"landlord";title?:string;reference?:string;goal?:string};

const goals=["상가 임대차 후보 비교","내 점포 임대 의뢰","상가 매수 검토","상가 매도 자료 준비","양도양수 조건 검토"];

/** `sidebar` is the short form inside the dark contact card on detail pages. */
export function InquiryForm({context,variant="dialog"}:{context:InquiryContext;variant?:"dialog"|"sidebar"}){
 const id=useId();
 const moving=useSiteMotion();
 const phoneRef=useRef<HTMLInputElement>(null);
 const requestId=useRef("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false),[submitted,setSubmitted]=useState(false);
 const sidebar=variant==="sidebar";
 const isListing=context.kind==="listing",isLandlord=context.kind==="landlord";
 const buttonText=isListing?"이 매물 상담 요청":isLandlord?"내 점포 임대 상담 요청":context.kind==="work"?"비슷한 고민 상담 요청":"내 조건에 맞는 점포 요청";

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const data=new FormData(event.currentTarget);
  const phone=String(data.get("phone")||"").trim();
  if(!/^(?:0\d{8,10}|\+\d{8,15})$/.test(phone.replace(/[\s()-]/g,""))){
   setError("연락받을 전화번호를 확인해 주세요. 예: 010-1234-5678");
   phoneRef.current?.focus();
   return;
  }
  setError("");
  if(!requestId.current)requestId.current=crypto.randomUUID();
  setBusy(true);
  try{
   const response=await fetch("/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(30000),body:JSON.stringify({
    requestId:requestId.current,kind:context.kind,title:context.title||"",reference:context.reference||"",
    goal:String(data.get("goal")||context.goal||"상가 임대차 후보 비교"),phone,industry:String(data.get("industry")||""),
    message:String(data.get("requirements")||""),time:String(data.get("time")||"시간 무관"),consent:data.get("consent")==="on",website:String(data.get("website")||""),
   })});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||"접수하지 못했습니다.");
   setSubmitted(true);
  }catch(reason){
   setError(reason instanceof Error&&reason.name!=="TimeoutError"?reason.message:"접수 결과를 확인하지 못했습니다. 다시 눌러 확인하거나 전화해 주세요.");
  }finally{setBusy(false);}
 }

 if(submitted)return <div role="status" className="mt-4 rounded-lg border border-[#ddd] bg-gray-50 p-6 leading-[1.8] text-[#222]">
  <Character state="success" moving={moving} className="block"/>
  <strong className="text-lead">상담 문의가 접수됐습니다.</strong>
  <p>김영선 공인중개사가 확인 후 연락드리겠습니다.</p>
  {context.reference&&<p>문의 자료: {context.reference}</p>}
 </div>;

 const field=cn("flex flex-col gap-2 font-medium",sidebar?"text-caption text-gray-300 max-md:text-xs":"text-xs");
 const note=sidebar?"text-gray-300":"";
 return <form className={cn("flex flex-col",sidebar?"mt-4 gap-3":"mt-5 gap-4")} onSubmit={submit}>
  <div className={cn("flex items-center gap-2 text-xs",sidebar?"text-gray-400":"text-gray-800")}>
   <Character state={error?"fail":"think"} moving={moving} loop={busy} className="size-16"/>
   <span>{busy?"문의 내용을 안전하게 접수하고 있습니다.":error?"입력 내용과 안내를 확인해 주세요.":"희망 업종과 예산부터 알려주세요."}</span>
  </div>
  <label className="absolute -left-[10000px]" aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off"/></label>
  {!sidebar&&!isListing&&<label className={field}>어떤 도움이 필요하세요?
   <NativeSelect name="goal" defaultValue={context.goal||goals[0]} className="h-auto rounded-lg border-[#ddd] py-3 text-body">{goals.map(goal=><option key={goal}>{goal}</option>)}</NativeSelect>
  </label>}
  <div className={cn("grid gap-3",!sidebar&&"md:grid-cols-2")}>
   <label className={field}><span className="flex items-center gap-2">연락받을 전화번호 <Required/></span>
    <Input ref={phoneRef} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required maxLength={24} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined} onChange={()=>{if(error)setError("");}} className={cn(sidebar&&"placeholder:text-tiny")}/>
   </label>
   {!sidebar&&<label className={field}><span className="flex items-center gap-2">희망 업종·현재 상황 <Optional/></span><Input name="industry" placeholder="예: 카페 첫 창업, 뷰티샵 이전" maxLength={100}/></label>}
  </div>
  {error&&<p id={`${id}-error`} role="alert" className={cn("text-caption leading-[1.7]",sidebar?"text-brand-soft":"text-brand")}>{error}</p>}
  <label className={field}><span className="flex items-center gap-2">{isListing?"이 매물에 대해 궁금한 점":"간단한 요구 사항"} <Optional/></span>
   <Textarea name="requirements" rows={3} maxLength={1000} className={cn(sidebar&&"text-xs placeholder:text-tiny max-md:text-base")} placeholder={isListing?"예: 카페 가능한가요? 시설과 입주 시기를 알고 싶어요.":isLandlord?"예: 산본 1층 25평, 음식점 자리 임대하고 싶어요.":"예: 카페 준비 중이에요. 총예산 5천만원, 월세 150만원 이하로 찾습니다."}/>
  </label>
  <details className={cn("group text-caption",sidebar?"text-gray-300":"text-gray-600")}>
   <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 after:ml-1 after:text-gray-500 after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden"><Clock size={13}/>연락 가능한 시간 <span className="text-tiny text-gray-500">선택</span></summary>
   <NativeSelect name="time" aria-label="연락 가능한 시간" defaultValue="시간 무관" wrapperClassName="mt-2" className="h-9 rounded-lg border-[#ddd] text-xs text-gray-800">
    <option>시간 무관</option><option>오전 (9시–12시)</option><option>오후 (12시–18시)</option><option>요구 사항에 적은 시간</option>
   </NativeSelect>
  </details>
  <label className={cn("flex cursor-pointer items-start gap-2 leading-[1.75]",sidebar?"text-micro text-gray-300 max-md:text-caption":"text-tiny text-gray-700 max-md:text-caption")}>
   <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-brand"/>
   <span>상담 연락을 위한 전화번호·문의 내용 제공에 동의합니다. <small className="whitespace-nowrap text-micro text-brand">필수</small></span>
  </label>
  <Button type="submit" disabled={busy} className="h-11 w-full text-body">{busy?"접수 중…":buttonText}<ArrowRight size={15}/></Button>
  <p className={cn("flex items-start justify-center gap-1 text-center leading-[1.7]",sidebar?"text-micro max-md:text-caption":"text-tiny text-gray-800 max-md:text-caption",note)}><Phone size={12} className="mt-0.5"/>김영선 공인중개사가 확인 후 최대한 빨리 연락드립니다.</p>
  <p className="text-center text-micro leading-[1.65] text-gray-500 max-md:text-tiny">연락처와 문의 내용은 상담을 위해 비공개로 저장되며 담당 관리자에게 알림으로 전달됩니다. 상담 목적으로만 이용합니다.</p>
 </form>;
}

const Required=()=><em className="text-micro font-medium not-italic text-brand">필수</em>;
const Optional=()=><small className="text-tiny font-normal text-gray-500">선택</small>;
