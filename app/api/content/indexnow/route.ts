import {readBody,sameOrigin,serverDB} from "@/lib/inquiries/server";
import {INDEXNOW_KEY,canSubmitIndexNow,indexNowBody} from "@/lib/seo";
import {site} from "@/lib/site";

// After a listing is published or its status changes, tell Bing·Naver·Daum (IndexNow) right away.
// Admin only. Body: {ids?: string[]} = lineestate_published ids; without ids the newest 3 are sent.
// Google does not take IndexNow; it reads the sitemap.
export async function POST(request:Request){
 const headers={"Cache-Control":"no-store"};
 if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403,headers});
 const token=request.headers.get("authorization")?.replace(/^Bearer /,"");if(!token)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
 try{
  const db=serverDB(),user=await db.auth.getUser(token);if(user.error||!user.data.user?.email)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
  const admin=await db.from("lineestate_admins").select("email").eq("email",user.data.user.email.toLowerCase()).eq("enabled",true).maybeSingle();if(admin.error||!admin.data)return Response.json({error:"관리자 권한이 필요합니다."},{status:403,headers});
  const input=await readBody(request).catch(()=>({}));
  const ids=Array.isArray(input.ids)?input.ids.filter((x:unknown)=>typeof x==="string").slice(0,20):[];
  let query=db.from("lineestate_published").select("number,content->>kind").order("published_at",{ascending:false});
  query=ids.length?query.in("id",ids):query.limit(3);
  const {data,error}=await query;if(error)throw error;
  const paths=["/","/listings","/works",...(data||[]).map((r:{number:string;kind:string})=>`/${r.kind==="work"?"works":"property"}/${r.number}`)];
  if(!canSubmitIndexNow(site.url))return Response.json({ok:true,skipped:"not the public address",paths},{headers});
  const response=await fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(indexNowBody(site.url,INDEXNOW_KEY,paths)),signal:AbortSignal.timeout(8000)});
  return Response.json({ok:response.ok,status:response.status,paths},{status:response.ok?200:502,headers});
 }catch{return Response.json({error:"검색엔진 알림을 보내지 못했습니다."},{status:502,headers});}
}
