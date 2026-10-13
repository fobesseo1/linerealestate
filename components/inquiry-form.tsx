"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Clock, Phone } from "lucide-react";
import {DesignCharacter} from "./design-character";
import {useSiteMotion} from "./site-motion";
import { Button } from "@/components/ui/button";

export type InquiryContext = { kind: "general" | "listing" | "work" | "landlord"; title?: string; reference?: string; goal?: string };

export function InquiryForm({ context, compact = false, characters=false, onPreview }: {
  context: InquiryContext; compact?: boolean; characters?:boolean; onPreview: (draft: string) => void;
}) {
  const id = useId();
  const moving=useSiteMotion();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy,setBusy]=useState(false),[submitted,setSubmitted]=useState(false);
  const requestId=useRef("");
  const isListing = context.kind === "listing";
  const isLandlord = context.kind === "landlord";
  const buttonText = isListing ? "이 매물 상담 요청" : isLandlord ? "내 점포 임대 상담 요청" : context.kind === "work" ? "비슷한 고민 상담 요청" : "내 조건에 맞는 점포 요청";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") || "").trim();
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^(?:0\d{8,10}|\+\d{8,15})$/.test(normalized)) {
      setError("연락받을 전화번호를 확인해 주세요. 예: 010-1234-5678");
      phoneRef.current?.focus();
      return;
    }
    setError("");
    if(!requestId.current)requestId.current=crypto.randomUUID();
    setBusy(true);
    try{
      const response=await fetch("/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId:requestId.current,kind:context.kind,title:context.title||"",reference:context.reference||"",goal:String(data.get("goal")||context.goal||"상가 임대차 후보 비교"),phone,industry:String(data.get("industry")||""),message:String(data.get("requirements")||""),time:String(data.get("time")||"시간 무관"),consent:data.get("consent")==="on",website:String(data.get("website")||"")}),signal:AbortSignal.timeout(30000)});
      const result=await response.json();if(!response.ok)throw Error(result.error||"접수하지 못했습니다.");setSubmitted(true);
    }catch(reason){setError(reason instanceof Error&&reason.name!=="TimeoutError"?reason.message:"접수 결과를 확인하지 못했습니다. 다시 눌러 확인하거나 전화해 주세요.");}
    finally{setBusy(false);}
  }
  if(submitted)return <div className="inquiry-success" role="status">{characters&&<DesignCharacter state="success" moving={moving}/>}<strong>상담 문의가 접수됐습니다.</strong><p>김영선 공인중개사가 확인 후 연락드리겠습니다.</p>{context.reference&&<p>문의 자료: {context.reference}</p>}</div>;
  return <form className={`inquiry-form ${compact ? "compact" : ""}`} onSubmit={submit}>
    {characters&&<div className="inquiry-character-status"><DesignCharacter state={error?"fail":"think"} moving={moving} loop={busy}/><span>{busy?"문의 내용을 안전하게 접수하고 있습니다.":error?"입력 내용과 안내를 확인해 주세요.":"희망 업종과 예산부터 알려주세요."}</span></div>}
    <label style={{position:"absolute",left:"-10000px"}} aria-hidden="true">웹사이트<input name="website" tabIndex={-1} autoComplete="off"/></label>
    {!compact && !isListing && <label className="inquiry-field">어떤 도움이 필요하세요?
      <select name="goal" defaultValue={context.goal || "상가 임대차 후보 비교"}>
        <option>상가 임대차 후보 비교</option><option>내 점포 임대 의뢰</option><option>상가 매수 검토</option><option>상가 매도 자료 준비</option><option>양도양수 조건 검토</option>
      </select>
    </label>}
    <div className="inquiry-field-row">
      <label className="inquiry-field"><span>연락받을 전화번호 <em>필수</em></span>
        <input ref={phoneRef} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required maxLength={24} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={() => { if(error) setError(""); }}/>
      </label>
      {!compact && <label className="inquiry-field"><span>희망 업종·현재 상황 <small>선택</small></span><input name="industry" placeholder="예: 카페 첫 창업, 뷰티샵 이전" maxLength={100}/></label>}
    </div>
    {error && <p id={`${id}-error`} className="inquiry-error" role="alert">{error}</p>}
    <label className="inquiry-field"><span>{isListing ? "이 매물에 대해 궁금한 점" : "간단한 요구 사항"} <small>선택</small></span>
      <textarea name="requirements" rows={compact ? 3 : 3} maxLength={1000} placeholder={isListing ? "예: 카페 가능한가요? 시설과 입주 시기를 알고 싶어요." : isLandlord ? "예: 산본 1층 25평, 음식점 자리 임대하고 싶어요." : "예: 카페 준비 중이에요. 총예산 5천만원, 월세 150만원 이하로 찾습니다."}/>
    </label>
    <details className="inquiry-time"><summary><Clock size={13}/>연락 가능한 시간 <span>선택</span></summary>
      <select name="time" aria-label="연락 가능한 시간" defaultValue="시간 무관"><option>시간 무관</option><option>오전 (9시–12시)</option><option>오후 (12시–18시)</option><option>요구 사항에 적은 시간</option></select>
    </details>
    <label className="inquiry-consent"><input type="checkbox" name="consent" required/><span>상담 연락을 위한 전화번호·문의 내용 제공에 동의합니다. <small>필수</small></span></label>
    <div className="inquiry-actions"><Button type="submit" disabled={busy} className="w-full">{busy?"접수 중…":buttonText}<ArrowRight size={15}/></Button></div>
    <p className="inquiry-response"><Phone size={12}/>김영선 공인중개사가 확인 후 최대한 빨리 연락드립니다.</p>
    <p className="inquiry-demo-note">연락처와 문의 내용은 상담을 위해 비공개로 저장되며 담당 관리자에게 알림으로 전달됩니다. 상담 목적으로만 이용합니다.</p>
  </form>;
}
