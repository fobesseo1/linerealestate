"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export type InquiryContext = { kind: "general" | "listing" | "work" | "landlord"; title?: string; reference?: string; goal?: string };

export function InquiryForm({ context, compact = false, onPreview }: {
  context: InquiryContext; compact?: boolean; onPreview: (draft: string) => void;
}) {
  const id = useId();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const isListing = context.kind === "listing";
  const isLandlord = context.kind === "landlord";
  const buttonText = isListing ? "이 매물 상담 요청" : isLandlord ? "내 점포 임대 상담 요청" : context.kind === "work" ? "비슷한 고민 상담 요청" : "내 조건에 맞는 점포 요청";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") || "").trim();
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^(?:0\d{8,10}|\+\d{8,15})$/.test(normalized)) {
      setError("연락받을 전화번호를 확인해 주세요. 예: 010-1234-5678");
      phoneRef.current?.focus();
      return;
    }
    setError("");
    const lines = [
      "안녕하세요, 선 공인중개사 김영선 공인중개사님.",
      `상담 분야: ${String(data.get("goal") || context.goal || "상가 임대차 후보 비교")}`,
      ...(context.title ? [`${isListing ? "문의 매물" : "참고 사례"}: ${context.title}`] : []),
      ...(context.reference ? [`매물번호: ${context.reference}`] : []),
      `연락받을 전화번호: ${phone}`,
      `희망 업종·상황: ${String(data.get("industry") || "상담 시 함께 정리")}`,
      `요구 사항: ${String(data.get("requirements") || "상담 시 함께 정리")}`,
      `연락 가능한 시간: ${String(data.get("time") || "시간 무관")}`,
      "상담 연락을 위한 정보 제공 동의: 확인",
    ];
    onPreview(lines.join("\n"));
  }

  return <form className={`inquiry-form ${compact ? "compact" : ""}`} onSubmit={submit}>
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
    <div className="inquiry-actions"><Button type="submit" className="w-full">{buttonText}<ArrowRight size={15}/></Button></div>
    <p className="inquiry-response"><Phone size={12}/>김영선 공인중개사가 확인 후 최대한 빨리 연락드립니다.</p>
    <p className="inquiry-demo-note">현재는 시안입니다. 요청 내용 미리보기만 제공하며 실제로 접수·저장되지 않습니다.</p>
  </form>;
}
