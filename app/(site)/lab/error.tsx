"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";

/** Shown when the public-data API key is missing or the API is unavailable. */
export default function LabError({reset}: {error: Error; reset: () => void}) {
  return <div className="mx-auto mt-16 max-w-140 border border-gray-200 bg-white p-8 text-center">
    <h1 className="text-xl font-bold">상권 데이터를 불러오지 못했습니다</h1>
    <p className="mt-3 text-body leading-[1.8] text-gray-800">공공데이터 API 키(PUBLICDATA_API_KEY)가 설정되지 않았거나 공공데이터포털 응답이 늦습니다. 잠시 후 다시 시도해 주세요.</p>
    <div className="mt-6 flex justify-center gap-3">
      <Button onClick={reset}>다시 시도</Button>
      <Button asChild variant="outline"><Link href="/lab">테스트 목록</Link></Button>
    </div>
  </div>;
}
