"use client";
import {useEffect,useState,type FormEvent} from "react";
import {Eye,EyeOff,MapPin,Pencil,Plus,RefreshCw,Trash2,X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {NativeSelect} from "@/components/ui/native-select";
import {contentClient} from "@/lib/content/client";
import {dealTypeLabel,type DealRecord} from "@/lib/content/types";

const industries=["음식점","주점","카페","미용","병원·의료","학원·스터디","PC카페","스포츠","기타"];
type Draft=Pick<DealRecord,"contracted_month"|"name"|"industry"|"deal_type"|"map_url"|"case_number"|"sort_order">;
const blank=():Draft=>({contracted_month:new Date().toISOString().slice(0,7),name:"",industry:"",deal_type:"lease",map_url:"",case_number:"",sort_order:1});

/** Yearly contract record shown on /works. Short naver.me links are turned into full map links on save. */
export default function DealRecordsAdmin(){
 const [records,setRecords]=useState<DealRecord[]>([]);
 const [editing,setEditing]=useState<string|null>(null);
 const [draft,setDraft]=useState<Draft>(blank);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");

 async function load(){
  const db=contentClient();if(!db)return;
  const {data,error}=await db.from("lineestate_deal_records").select("*").order("contracted_month",{ascending:false}).order("sort_order",{ascending:false});
  if(error)setMessage("기록을 불러오지 못했습니다.");else setRecords(data||[]);
 }
 useEffect(()=>{load();},[]);

 async function run(task:()=>Promise<void>,done:string){
  setBusy(true);setMessage("");
  try{await task();await load();setMessage(done);}
  catch(reason){setMessage(reason instanceof Error?reason.message:"저장하지 못했습니다.");}
  finally{setBusy(false);}
 }

 async function fullMapLink(url:string){
  if(!url.trim())return "";
  const db=contentClient();const token=(await db?.auth.getSession())?.data.session?.access_token;
  if(!token)throw Error("관리자 로그인이 필요합니다.");
  const response=await fetch("/api/content/naver-link",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({url})});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||"지도 링크를 확인하지 못했습니다.");
  return result.url as string;
 }

 function save(event:FormEvent){
  event.preventDefault();
  run(async()=>{
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(draft.contracted_month))throw Error("계약 연월을 선택해 주세요.");
   if(!draft.name.trim())throw Error("상호를 입력해 주세요.");
   const row={...draft,name:draft.name.trim(),case_number:draft.case_number.trim().toUpperCase(),map_url:await fullMapLink(draft.map_url),updated_at:new Date().toISOString()};
   const db=contentClient()!;
   const {error}=editing&&editing!=="new"?await db.from("lineestate_deal_records").update(row).eq("id",editing):await db.from("lineestate_deal_records").insert(row);
   if(error)throw Error("저장하지 못했습니다. 입력 내용을 확인해 주세요.");
   setEditing(null);setDraft(blank());
  },"저장했습니다. 공개 화면에는 30초 안에 반영됩니다.");
 }

 const start=(record?:DealRecord)=>{setMessage("");setEditing(record?.id||"new");setDraft(record?{contracted_month:record.contracted_month,name:record.name,industry:record.industry,deal_type:record.deal_type,map_url:record.map_url,case_number:record.case_number,sort_order:record.sort_order}:blank());};
 const years=[...new Set(records.map(r=>r.contracted_month.slice(0,4)))];
 const form=<form onSubmit={save} className="grid grid-cols-[150px_minmax(0,1fr)_150px] gap-3 border border-gray-200 bg-gray-50 p-4 max-lg:grid-cols-2 max-md:grid-cols-1">
  <Field label="계약 연월"><Input type="month" value={draft.contracted_month} onChange={e=>setDraft({...draft,contracted_month:e.target.value})} required/></Field>
  <Field label="상호"><Input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="예: 편백회관 산본점" required maxLength={80}/></Field>
  <Field label="업종"><NativeSelect value={draft.industry} onChange={e=>setDraft({...draft,industry:e.target.value})} className="h-11 rounded-lg"><option value="">선택 안 함</option>{industries.map(i=><option key={i}>{i}</option>)}</NativeSelect></Field>
  <Field label="네이버 지도 링크 (naver.me 공유 링크 가능)" className="col-span-2 max-md:col-span-1"><Input value={draft.map_url} onChange={e=>setDraft({...draft,map_url:e.target.value})} placeholder="https://naver.me/… 또는 https://map.naver.com/…"/></Field>
  <Field label="거래 유형"><NativeSelect value={draft.deal_type} onChange={e=>setDraft({...draft,deal_type:e.target.value as Draft["deal_type"]})} className="h-11 rounded-lg">{Object.entries(dealTypeLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}</NativeSelect></Field>
  <Field label="연결할 중개 사례 번호"><Input value={draft.case_number} onChange={e=>setDraft({...draft,case_number:e.target.value})} placeholder="예: SUN-1005 (없으면 비움)" maxLength={20}/></Field>
  <Field label="같은 달 순서 (클수록 위)"><Input type="number" min={0} max={99} value={draft.sort_order} onChange={e=>setDraft({...draft,sort_order:Number(e.target.value)})}/></Field>
  <div className="flex items-end gap-2"><Button type="submit" disabled={busy} className="flex-1">저장</Button><Button type="button" variant="outline" onClick={()=>setEditing(null)} aria-label="취소"><X size={16}/></Button></div>
 </form>;

 return <section className="mx-auto max-w-350 px-6 pb-16">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
   <div><h2 className="text-xl font-bold">입점 기록 <span className="text-sm font-normal text-gray-600">{records.length}건</span></h2><p className="mt-1 text-xs text-gray-600">중개 완료 사례 페이지의 연도별 기록에 표시됩니다. 숨긴 기록은 공개 화면에 나오지 않습니다.</p></div>
   <div className="flex gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={()=>load()}><RefreshCw size={15}/>새로고침</Button><Button size="sm" disabled={busy} onClick={()=>start()}><Plus size={15}/>기록 추가</Button></div>
  </div>
  {message&&<p role="status" className="mb-4 text-sm text-gray-800">{message}</p>}
  {editing==="new"&&<div className="mb-6">{form}</div>}
  {years.map(year=><div key={year} className="mb-6">
   <h3 className="mb-2 text-lg font-bold">{year}</h3>
   <ul className="border-t border-ink bg-white">
    {records.filter(r=>r.contracted_month.startsWith(year)).map(r=>editing===r.id?<li key={r.id} className="border-b border-gray-200 p-2">{form}</li>:<li key={r.id} className={`flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3 ${r.visible?"":"opacity-50"}`}>
     <span className="w-10 text-xs text-gray-600">{Number(r.contracted_month.slice(5))}월</span>
     <strong className="min-w-40 flex-1 text-sm">{r.name}</strong>
     <span className="text-xs text-gray-700">{r.industry||"업종 없음"} · {dealTypeLabel[r.deal_type]}{r.case_number&&` · ${r.case_number}`}</span>
     {r.map_url?<a href={r.map_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-700 hover:text-brand"><MapPin size={14}/>지도</a>:<span className="text-xs text-brand">지도 링크 없음</span>}
     <div className="flex gap-1">
      <Button variant="ghost" size="icon" aria-label="수정" onClick={()=>start(r)}><Pencil size={15}/></Button>
      <Button variant="ghost" size="icon" aria-label={r.visible?"숨기기":"다시 보이기"} disabled={busy} onClick={()=>run(async()=>{const {error}=await contentClient()!.from("lineestate_deal_records").update({visible:!r.visible,updated_at:new Date().toISOString()}).eq("id",r.id);if(error)throw Error("변경하지 못했습니다.");},r.visible?"숨겼습니다.":"다시 보이게 했습니다.")}>{r.visible?<Eye size={15}/>:<EyeOff size={15}/>}</Button>
      <Button variant="ghost" size="icon" aria-label="삭제" disabled={busy} onClick={()=>{if(confirm(`'${r.name}' 기록을 삭제할까요? 되돌릴 수 없습니다.`))run(async()=>{const {error}=await contentClient()!.from("lineestate_deal_records").delete().eq("id",r.id);if(error)throw Error("삭제하지 못했습니다.");},"삭제했습니다.");}}><Trash2 size={15}/></Button>
     </div>
    </li>)}
   </ul>
  </div>)}
 </section>;
}

function Field({label,className,children}:{label:string;className?:string;children:React.ReactNode}){
 return <label className={`flex flex-col gap-1 text-xs font-medium text-gray-800 ${className||""}`}>{label}{children}</label>;
}
