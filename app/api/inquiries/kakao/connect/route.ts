import {cookies} from "next/headers";
import {randomBytes} from "node:crypto";
import {failure,loadConfig,requireAdmin,sameOrigin,siteOrigin} from "@/lib/inquiries/server";
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403});try{const user=await requireAdmin(request),config=await loadConfig();if(!config.kakaoKey)return Response.json({error:"카카오 REST API 키를 먼저 저장해 주세요."},{status:400});
 const state=randomBytes(32).toString("hex"),jar=await cookies();jar.set("linerealestate-kakao-state",JSON.stringify({state,admin:user.email}),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/inquiries/kakao",maxAge:600});
 const url=new URL("https://kauth.kakao.com/oauth/authorize");url.search=new URLSearchParams({client_id:config.kakaoKey,redirect_uri:`${siteOrigin}/api/inquiries/kakao/callback`,response_type:"code",scope:"talk_message",state}).toString();return Response.json({url:url.toString()},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return failure(error);}}
