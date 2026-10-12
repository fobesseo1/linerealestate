import "server-only";
import {createClient} from "@supabase/supabase-js";
import {createCipheriv,createDecipheriv,createHash,randomBytes} from "node:crypto";
import publicConfig from "@/lib/content/public-config.json";

export const siteOrigin="https://linerealestate.vercel.app";
export function serverDB(){
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!secret)throw Error("SERVER_NOT_CONFIGURED");
 return createClient(publicConfig.url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 return origin===siteOrigin || (process.env.NODE_ENV!=="production" && origin==="http://localhost:3010");
}
export async function requireAdmin(request:Request){
 const token=request.headers.get("authorization")?.replace(/^Bearer /,"");
 if(!token)throw Error("UNAUTHORIZED");
 const db=serverDB();const {data,error}=await db.auth.getUser(token);
 if(error||!data.user?.email)throw Error("UNAUTHORIZED");
 const result=await db.from("linerealestate_inquiry_admins").select("email").eq("email",data.user.email.toLowerCase()).eq("enabled",true).maybeSingle();
 if(result.error||!result.data)throw Error("UNAUTHORIZED");
 return data.user;
}
export type NotificationConfig={kakaoKey?:string;kakaoSecret?:string;accessToken?:string;refreshToken?:string;expiresAt?:number;kakaoConnectedBy?:string;gmailAppPassword?:string;sheetsSyncToken?:string;sheetsId?:string;naverMapKey?:string;naverMapSecret?:string};
function encryptionKey(){const secret=process.env.SUPABASE_SECRET_KEY;if(!secret)throw Error("SERVER_NOT_CONFIGURED");return createHash("sha256").update(`linerealestate-notifications-v1:${secret}`).digest();}
export async function loadConfig():Promise<NotificationConfig>{
 const {data,error}=await serverDB().from("linerealestate_notification_settings").select("encrypted_config").eq("id",true).maybeSingle();if(error)throw Error("SETTINGS_UNAVAILABLE");if(!data)return {};
 const [iv,tag,encrypted]=data.encrypted_config.split(".").map((x:string)=>Buffer.from(x,"base64"));
 const decrypt=createDecipheriv("aes-256-gcm",encryptionKey(),iv);decrypt.setAuthTag(tag);
 return JSON.parse(Buffer.concat([decrypt.update(encrypted),decrypt.final()]).toString("utf8"));
}
export async function saveConfig(config:NotificationConfig){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",encryptionKey(),iv);
 const data=Buffer.concat([cipher.update(JSON.stringify(config),"utf8"),cipher.final()]);
 const encrypted_config=[iv,cipher.getAuthTag(),data].map(x=>x.toString("base64")).join(".");
 const {error}=await serverDB().from("linerealestate_notification_settings").upsert({id:true,encrypted_config,updated_at:new Date().toISOString()});if(error)throw Error("SETTINGS_UNAVAILABLE");
}
export function privateHash(value:string){return createHash("sha256").update(`${process.env.SUPABASE_SECRET_KEY}:linerealestate:${value}`).digest("hex");}
export async function readBody(request:Request){if(Number(request.headers.get("content-length")||0)>10000)throw Error("TOO_LARGE");const text=await request.text();if(text.length>10000)throw Error("TOO_LARGE");const value=JSON.parse(text);if(!value||typeof value!=="object"||Array.isArray(value))throw Error("INVALID_BODY");return value;}
export function failure(error:unknown){const message=error instanceof Error?error.message:"";return Response.json({error:message==="UNAUTHORIZED"?"관리자 로그인이 필요합니다.":"처리하지 못했습니다. 잠시 후 다시 시도해 주세요."},{status:message==="UNAUTHORIZED"?401:503,headers:{"Cache-Control":"no-store"}});}
