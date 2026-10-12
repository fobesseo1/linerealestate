import {privateHash,readBody,sameOrigin,serverDB,failure} from "@/lib/inquiries/server";
import {validateInquiry} from "@/lib/inquiries/validation";
import {deliverInquiry} from "@/lib/inquiries/notifications";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:"사이트에서 다시 접수해 주세요."},{status:403});
 let input;try{input=await readBody(request);}catch{return Response.json({error:"문의 내용을 확인해 주세요."},{status:400});}
 if(input.website)return Response.json({error:"문의 내용을 확인해 주세요."},{status:400});
 let payload;try{payload=validateInquiry(input);}catch(error){return Response.json({error:error instanceof Error?error.message:"입력 내용을 확인해 주세요."},{status:400});}
 try{
 const ip=request.headers.get("x-vercel-forwarded-for")?.split(",")[0]||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";
 const {data,error}=await serverDB().rpc("linerealestate_accept_inquiry",{payload,request_uuid:payload.requestId,client_hash:privateHash(ip)});
 if(error){if(error.message.includes("RATE_LIMIT"))return Response.json({error:"문의가 이미 접수됐거나 요청이 많습니다. 잠시 후 다시 시도하거나 전화해 주세요."},{status:429});throw Error("SAVE_FAILED");}
 await deliverInquiry(data).catch(()=>{});
 return Response.json({ok:true,message:"상담 문의가 접수됐습니다. 확인 후 연락드리겠습니다."},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return failure(error);}
}
