"use client";

// 소상공인365 간단분석 화면 연동 (iframe).
// 365 allows only the certKey parameter, so region and industry cannot be preset:
// we show the visitor which choices to make inside the frame. We never read or store
// numbers from the frame; it is shown as 365's own screen with its source label.
import {useState} from "react";
import {BarChart3, ExternalLink} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";

export type Sbiz365Hint = {dong?: string; zone?: string; category?: string};

const src = (key: string) => `https://bigdata.sbiz.or.kr/#/openApi/simple?certKey=${encodeURIComponent(key)}`;

export function Sbiz365Steps({dong, zone, category}: Sbiz365Hint) {
  return <ol className="grid gap-1 text-body leading-[1.7] text-gray-900">
    <li><strong>1. 지역</strong> · {zone ? <>[주요 상권]에서 <strong className="text-brand">{zone}</strong> 선택{dong && <> (또는 [행정구역] 경기도 군포시 <strong>{dong}</strong>)</>}</> : dong ? <>[행정구역]에서 경기도 군포시 <strong className="text-brand">{dong}</strong> 선택</> : "지도에서 지역 선택"}</li>
    <li><strong>2. 업종</strong> · {category ? <><strong className="text-brand">{category}</strong> (또는 가장 가까운 업종) 선택</> : "보고 싶은 업종 선택"}</li>
    <li><strong>3.</strong> [분석하기]를 누르면 점포당 월평균 매출, 유동인구, 붐비는 시간대가 나옵니다.</li>
  </ol>;
}

export function Sbiz365Frame({certKey, className}: {certKey?: string; className?: string}) {
  if (!certKey) return <div className={`flex items-center justify-center bg-gray-50 p-6 text-center text-body text-gray-800 ${className ?? ""}`}>소상공인365 키(SBIZ365_SIMPLE_KEY)가 설정되지 않아 화면을 열 수 없습니다.</div>;
  return <iframe src={src(certKey)} title="소상공인365 간단분석" className={`w-full border-0 bg-white ${className ?? ""}`} allow="geolocation" referrerPolicy="strict-origin-when-cross-origin"/>;
}

export function Sbiz365Source() {
  return <p className="text-caption leading-[1.7] text-gray-700">출처: 소상공인시장진흥공단 소상공인365 간단분석. 매출은 365가 카드 결제 자료로 추정한 지역·업종 평균이며 특정 점포의 매출이 아닙니다. 선부동산이 계산한 값이 아닙니다.</p>;
}

/** Button that opens the 365 simple-analysis screen in a large dialog with selection hints. */
export function Sbiz365Button({certKey, label = "이 지역 매출 보기 (소상공인365)", className, ...hint}: Sbiz365Hint & {certKey?: string; label?: string; className?: string}) {
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" variant="outline" onClick={() => setOpen(true)} className={className}><BarChart3 size={16} aria-hidden/>{label}</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[92dvh] max-w-6xl flex-col gap-3 p-4 max-sm:w-full max-sm:max-w-none max-sm:rounded-none">
        <DialogTitle className="text-lg">소상공인365 매출 분석</DialogTitle>
        <DialogDescription asChild><div className="mt-0 border border-gray-200 bg-gray-50 p-3"><Sbiz365Steps {...hint}/></div></DialogDescription>
        <Sbiz365Frame certKey={certKey} className="min-h-0 flex-1"/>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Sbiz365Source/>
          {certKey && <a href={src(certKey)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-caption font-semibold text-brand">새 창으로 열기 <ExternalLink size={14} aria-hidden/></a>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
