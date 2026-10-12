import "server-only";
import nodemailer from "nodemailer";
import {loadConfig,saveConfig,serverDB,siteOrigin} from "./server";
async function kakaoToken(){
 const config=await loadConfig();if(!config.kakaoKey||!config.refreshToken)return null;
 if(config.accessToken&&Number(config.expiresAt)>Date.now()+60000)return config.accessToken;
 const body=new URLSearchParams({grant_type:"refresh_token",client_id:config.kakaoKey,refresh_token:config.refreshToken});if(config.kakaoSecret)body.set("client_secret",config.kakaoSecret);
 const response=await fetch("https://kauth.kakao.com/oauth/token",{method:"POST",body,signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error("KAKAO_REFRESH_FAILED");
 const token=await response.json();if(!token.access_token)throw Error("KAKAO_REFRESH_FAILED");
 // Re-read so refreshing credentials never overwrites an administrator's other settings.
 const latest=await loadConfig();if(latest.refreshToken!==config.refreshToken)throw Error("KAKAO_RECONNECTED");
 await saveConfig({...latest,accessToken:token.access_token,refreshToken:token.refresh_token||config.refreshToken,expiresAt:Date.now()+token.expires_in*1000});return token.access_token as string;
}
export async function sendKakao(text:string){const token=await kakaoToken();if(!token)return false;
 const template={object_type:"text",text:text.slice(0,490),link:{web_url:`${siteOrigin}/admin/?section=inquiries`,mobile_web_url:`${siteOrigin}/admin/?section=inquiries`},button_title:"문의 확인"};
 const response=await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:new URLSearchParams({template_object:JSON.stringify(template)}),signal:AbortSignal.timeout(8000)});
 const data=await response.json();if(!response.ok||data.result_code!==0)throw Error("KAKAO_SEND_FAILED");return true;
}
export async function sendGmail(text:string,subject:string,id:string){
 const config=await loadConfig();if(!config.gmailAppPassword)return false;
 const email="ysyh17301730@gmail.com";
 const smtp=nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:email,pass:config.gmailAppPassword},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true});
 await smtp.sendMail({from:{name:"선부동산 문의 알림",address:email},to:email,subject,messageId:`<linerealestate-${id}@linerealestate.vercel.app>`,text:`${text}\n\n관리자 문의함: ${siteOrigin}/admin/?section=inquiries`});return true;
}
export async function deliverInquiry(id:string){
 const db=serverDB();const {data:row,error}=await db.from("linerealestate_inquiries").select("*").eq("id",id).single();if(error||!row)throw Error("INQUIRY_UNAVAILABLE");
 const text=["[선부동산 · linerealestate] 새 상담 문의",row.listing_number?`${row.listing_number} ${row.listing_title}`:row.goal,`연락처: ${row.phone}`,`업종·상황: ${row.industry||"미입력"}`,`문의: ${row.message||"미입력"}`,`연락 시간: ${row.preferred_time||"시간 무관"}`].join("\n");
 await Promise.allSettled((["email","kakao"] as const).map(async channel=>{
 const column=`${channel}_status`;const {data:claimed,error:claimError}=await db.from("linerealestate_inquiries").update({[column]:"sending"}).eq("id",id).in(column,["pending","failed","disabled"]).select("id");if(claimError||!claimed?.length)return;
 let status="failed";try{status=(channel==="kakao"?await sendKakao(text):await sendGmail(text,`[선부동산] 상담 문의 ${row.listing_number||"접수"}`,id))?"sent":"disabled";}catch{status="failed";}
 await db.from("linerealestate_inquiries").update({[column]:status}).eq("id",id);
 }));
}
