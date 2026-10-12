import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {loadConfig,saveConfig,serverDB,siteOrigin} from "@/lib/inquiries/server";
export async function GET(request:Request){const jar=await cookies();let result="failed",reason="server";
 try{const saved=jar.get("linerealestate-kakao-state")?.value;jar.set("linerealestate-kakao-state","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/inquiries/kakao",maxAge:0});if(!saved){reason="expired";throw Error();}const state=JSON.parse(saved),url=new URL(request.url);if(url.searchParams.get("state")!==state.state){reason="expired";throw Error();}if(!url.searchParams.get("code")){reason="consent";throw Error();}
 const admin=await serverDB().from("linerealestate_inquiry_admins").select("email").eq("email",state.admin).eq("enabled",true).maybeSingle();if(admin.error||!admin.data){reason="admin";throw Error();}
 const config=await loadConfig();if(!config.kakaoKey){reason="config";throw Error();}const body=new URLSearchParams({grant_type:"authorization_code",client_id:config.kakaoKey,redirect_uri:`${siteOrigin}/api/inquiries/kakao/callback`,code:url.searchParams.get("code")!});if(config.kakaoSecret)body.set("client_secret",config.kakaoSecret);
 const response=await fetch("https://kauth.kakao.com/oauth/token",{method:"POST",body,signal:AbortSignal.timeout(10000)});const token=await response.json();if(!response.ok){reason=token.error_code==="KOE010"?"secret":"token";throw Error();}if(!token.access_token||!token.refresh_token){reason="token";throw Error();}if(typeof token.scope!=="string"||!token.scope.split(/[ ,]+/).includes("talk_message")){reason="consent";throw Error();}
 const latest=await loadConfig();if(latest.kakaoKey!==config.kakaoKey){reason="config";throw Error();}reason="server";await saveConfig({...latest,accessToken:token.access_token,refreshToken:token.refresh_token,expiresAt:Date.now()+token.expires_in*1000,kakaoConnectedBy:state.admin});result="connected";
 }catch{result="failed";}
 const destination=new URL("/admin/",siteOrigin);destination.searchParams.set("section","inquiries");destination.searchParams.set("kakao",result);if(result==="failed")destination.searchParams.set("reason",reason);
 const response=NextResponse.redirect(destination);response.headers.set("Cache-Control","no-store");response.headers.set("Referrer-Policy","no-referrer");return response;
}
