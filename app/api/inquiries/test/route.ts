import {failure,requireAdmin,sameOrigin} from "@/lib/inquiries/server";
import {sendGmail,sendKakao} from "@/lib/inquiries/notifications";
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403});try{await requireAdmin(request);const text="[선부동산 · linerealestate] 알림 연결 테스트입니다. 실제 고객 문의가 아닙니다.";
 const results=await Promise.allSettled([sendGmail(text,"[선부동산] 알림 연결 테스트",`test-${crypto.randomUUID()}`),sendKakao(text)]);
 const label=(result:PromiseSettledResult<boolean>)=>result.status==="fulfilled"?(result.value?"발송 완료":"설정 필요"):"발송 실패 · 설정을 확인해 주세요";
 return Response.json({ok:true,message:`Gmail: ${label(results[0])} / 카카오: ${label(results[1])}`});}catch(error){return failure(error);}}
