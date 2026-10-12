import {failure,readBody,requireAdmin,sameOrigin} from "@/lib/inquiries/server";
import {deliverInquiry} from "@/lib/inquiries/notifications";
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403});try{await requireAdmin(request);const {id}=await readBody(request);if(typeof id!=="string"||!/^[0-9a-f-]{36}$/i.test(id))return Response.json({error:"문의번호를 확인해 주세요."},{status:400});await deliverInquiry(id);return Response.json({ok:true});}catch(error){return failure(error);}}
