import {getPublicationCards} from "@/lib/content/public";

// Open pages poll this every 10 seconds; the shared CDN copy keeps them from each reaching the database.
export async function GET(){
 const items=await getPublicationCards();
 if(items===null)return Response.json({error:"UNAVAILABLE"},{status:502,headers:{"Cache-Control":"no-store"}});
 return Response.json(items,{headers:{"Cache-Control":"public, max-age=0, s-maxage=10"}});
}
