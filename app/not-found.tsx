import Link from "next/link";
import {Button} from "@/components/ui/button";
import {SiteShell} from "@/components/site/site-shell";

export default function NotFound(){
 return <SiteShell>
  <div className="page flex min-h-65 flex-col items-center justify-center gap-4 p-8 text-center text-gray-600">
   <h1 className="text-lead font-semibold text-gray-800">페이지 또는 공개된 자료를 찾을 수 없습니다.</h1>
   <Button asChild><Link href="/">홈으로</Link></Button>
  </div>
 </SiteShell>;
}
