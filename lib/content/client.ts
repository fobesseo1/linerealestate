import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import config from "./public-config.json";
let client:SupabaseClient|null=null;
export function contentClient() {
 const url=config.url, key=config.publishableKey;
 if(!url||!key)return null;
 if(!client)client=createClient(url,key,{auth:{storageKey:"lineestate-admin-auth",persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 return client;
}
export const originalsBucket="lineestate-originals";
export const publicBucket="lineestate-public";
