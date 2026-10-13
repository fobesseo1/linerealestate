import {createClient} from "@supabase/supabase-js";
import config from "./public-config.json";
import type {Publication} from "./types";

// Published content is public; cache each read for 30 seconds so pages stay fast and fresh.
const db=config.url&&config.publishableKey?createClient(config.url,config.publishableKey,{
 auth:{persistSession:false,autoRefreshToken:false},
 global:{fetch:(input,init)=>fetch(input,{...init,next:{revalidate:30}})},
}):null;

/** Server-side read of public listings and cases. `null` means the read failed. */
export async function getPublications():Promise<Publication[]|null>{
 if(!db)return [];
 const {data,error}=await db.from("lineestate_published").select("*").in("status",["active","completed"]).order("published_at",{ascending:false});
 if(error){console.error("lineestate_published read failed",error.message);return null;}
 return data||[];
}
