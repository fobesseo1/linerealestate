import {loadConfig,readBody,sameOrigin,serverDB} from "@/lib/inquiries/server";
import {mapAddress,matchCoordinates} from "@/lib/maps/address.mjs";
export async function POST(request:Request){
 const headers={"Cache-Control":"no-store"};
 if(!sameOrigin(request))return Response.json({error:"허용되지 않은 요청입니다."},{status:403,headers});
 try{
  const token=request.headers.get("authorization")?.replace(/^Bearer /,"");if(!token)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
  const db=serverDB(),user=await db.auth.getUser(token);if(user.error||!user.data.user?.email)return Response.json({error:"관리자 로그인이 필요합니다."},{status:401,headers});
  const admin=await db.from("lineestate_admins").select("email").eq("email",user.data.user.email.toLowerCase()).maybeSingle();if(admin.error||!admin.data)return Response.json({error:"관리자 권한이 필요합니다."},{status:403,headers});
  const input=await readBody(request);if(typeof input.address!=="string"||!input.address.trim()||input.address.length>200)return Response.json({error:"건물 주소를 입력해 주세요."},{status:400,headers});
  const config=await loadConfig();if(!config.naverMapKey||!config.naverMapSecret)throw Error();
  const query=mapAddress(input.address),url=new URL("https://maps.apigw.ntruss.com/map-geocode/v2/geocode");url.searchParams.set("query",query);
  let position=null;
  for(let attempt=0;attempt<2;attempt++){
   try{const response=await fetch(url,{headers:{"x-ncp-apigw-api-key-id":config.naverMapKey,"x-ncp-apigw-api-key":config.naverMapSecret},signal:AbortSignal.timeout(8000)});
    if(!response.ok){if(response.status===429||response.status>=500)continue;throw Error();}
    const data=await response.json();position=matchCoordinates(query,data.addresses||[]);break;
   }catch{if(attempt===1)throw Error();}
  }
  if(!position)return Response.json({error:"네이버에서 같은 번지의 건물을 확인하지 못했습니다. 건물 주소에 번지 또는 도로명·건물번호가 있는지 확인해 주세요."},{status:422,headers});
  return Response.json(position,{headers});
 }catch{return Response.json({error:"주소 확인 서비스에 연결하지 못했습니다. 잠시 후 다시 저장해 주세요."},{status:503,headers});}
}
