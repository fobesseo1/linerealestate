import type {SupabaseClient} from "@supabase/supabase-js";

// Consume only credentials returned to this app; never log or retain the URL.
export async function consumeAuthReturn(db:SupabaseClient, raw:string) {
 const url=new URL(raw);
 const fragment=new URLSearchParams(url.hash.slice(1));
 if(fragment.get("error_description")||url.searchParams.get("error_description"))throw Error("메일의 인증 링크가 만료됐습니다. 설정 메일을 다시 받아주세요.");
 const access=fragment.get("access_token"),refresh=fragment.get("refresh_token");
 if(access&&refresh){const {error}=await db.auth.setSession({access_token:access,refresh_token:refresh});if(error)throw Error("인증 링크가 만료됐습니다. 설정 메일을 다시 받아주세요.");return true;}
 const code=url.searchParams.get("code");
 if(code){const {error}=await db.auth.exchangeCodeForSession(code);if(error)throw Error("인증을 완료하지 못했습니다. 메일을 요청한 브라우저에서 다시 열어주세요.");return true;}
 const token=url.searchParams.get("token_hash")||url.searchParams.get("token");
 if(token){const type=url.searchParams.get("type");if(!["email","magiclink","recovery","signup","invite"].includes(type||""))throw Error("설정 메일의 링크 전체를 입력해 주세요.");const {error}=await db.auth.verifyOtp({token_hash:token,type:type as "email"|"magiclink"|"recovery"|"signup"|"invite"});if(error)throw Error("인증 링크가 만료됐습니다. 설정 메일을 다시 받아주세요.");return true;}
 return false;
}
