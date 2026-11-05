import Link from "next/link";
import {ArrowRight, FlaskConical} from "lucide-react";
import {LABS} from "@/components/lab/lab-ui";

export default function Page() {
  return <>
    <header className="mb-8 mt-8">
      <span className="flex items-center gap-2 text-tiny font-demibold tracking-[.2em] text-brand"><FlaskConical size={14} aria-hidden/>LAB</span>
      <h1 className="mt-2 text-[clamp(28px,3.4vw,48px)] font-heavy leading-[1.3]">상권 데이터 테스트</h1>
      <p className="mt-3 max-w-185 text-sm leading-[1.8] text-gray-800">소상공인시장진흥공단 상가(상권)정보로 만든 시험 화면입니다. 기존 사이트 화면은 그대로 두었고, 이 페이지들은 메뉴에 연결되지 않습니다. 매출 금액은 다루지 않고 업소 수·업종·위치만 씁니다.</p>
    </header>
    <ul className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      {LABS.map(l => <li key={l.slug}>
        <Link href={`/lab/${l.slug}`} className="group flex h-full flex-col border border-gray-200 bg-white p-5 transition-colors hover:border-brand">
          <span className="text-tiny font-demibold tracking-[.2em] text-brand">아이디어 {l.no}</span>
          <strong className="mt-2 text-lg">{l.title}</strong>
          <span className="mt-2 flex-1 text-body leading-[1.7] text-gray-800">{l.text}</span>
          <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand">열기 <ArrowRight size={14} aria-hidden className="transition-transform group-hover:translate-x-1"/></span>
        </Link>
      </li>)}
    </ul>
  </>;
}
