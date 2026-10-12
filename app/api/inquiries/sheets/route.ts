import {timingSafeEqual} from "node:crypto";
import {loadConfig,serverDB} from "@/lib/inquiries/server";
export async function GET(request:Request){
 const headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"};
 try{
  const config=await loadConfig(),provided=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
  if(!config.sheetsSyncToken||provided.length!==config.sheetsSyncToken.length||!timingSafeEqual(Buffer.from(provided),Buffer.from(config.sheetsSyncToken)))return Response.json({error:"UNAUTHORIZED"},{status:401,headers});
  const url=new URL(request.url),after=url.searchParams.get("after"),id=url.searchParams.get("id");
  if((after||id)&&(!after||!id||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|\+00:00)$/.test(after)||!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)))return Response.json({error:"INVALID_CURSOR"},{status:400,headers});
  let query=serverDB().from("linerealestate_inquiries").select("id,site_id,created_at,kind,listing_number,listing_title,goal,phone,industry,message,preferred_time,status").eq("site_id","linerealestate").order("created_at").order("id").limit(100);
  if(after&&id)query=query.or(`created_at.gt.${after},and(created_at.eq.${after},id.gt.${id})`);
  const {data,error}=await query;if(error)throw Error();
  return Response.json({site:"linerealestate",sheetId:config.sheetsId,rows:data||[]},{headers});
 }catch{return Response.json({error:"SYNC_UNAVAILABLE"},{status:503,headers});}
}
