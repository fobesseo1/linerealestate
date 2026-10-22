import {readBody,sameOrigin,serverDB} from "@/lib/inquiries/server";

/** Turns a naver.me or map.naver.com link into a place page that opens on phones and PCs (admin only). */
export async function POST(request:Request){
 const headers={"Cache-Control":"no-store"};
 if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403,headers});
 const token=request.headers.get("authorization")?.replace(/^Bearer /,"");if(!token)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
 const db=serverDB(),user=await db.auth.getUser(token);if(user.error||!user.data.user?.email)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
 const admin=await db.from("lineestate_admins").select("email").eq("email",user.data.user.email.toLowerCase()).maybeSingle();if(admin.error||!admin.data)return Response.json({error:"관리자 권한이 필요합니다."},{status:403,headers});
 const input=await readBody(request);
 let link:URL;
 try{link=new URL(String(input.url||"").trim());}catch{return Response.json({error:"네이버 지도 링크를 확인해 주세요."},{status:400,headers});}
 const place=(url:URL)=>["map.naver.com","m.place.naver.com","pcmap.place.naver.com"].includes(url.hostname)&&url.pathname.match(/\/(?:place|restaurant|hairshop|hospital|accommodation)\/(\d+)/)?.[1];
 // map.naver.com entry links send phones to the app; the place page opens everywhere.
 const full=(id:string)=>`https://m.place.naver.com/place/${id}/home`;
 if(place(link))return Response.json({url:full(place(link) as string)},{headers});
 if(link.protocol!=="https:"||link.hostname!=="naver.me")return Response.json({error:"네이버 지도·플레이스 링크만 넣을 수 있습니다."},{status:400,headers});
 try{
  // Only the first redirect is read; the request never leaves naver.me.
  const response=await fetch(link,{redirect:"manual",signal:AbortSignal.timeout(8000)});
  const target=new URL(response.headers.get("location")||"");
  const id=place(target);
  if(!id)throw Error();
  return Response.json({url:full(id)},{headers});
 }catch{return Response.json({error:"이 링크에서 네이버 지도 장소를 찾지 못했습니다. 네이버 지도의 '공유' 링크를 넣어 주세요."},{status:422,headers});}
}
