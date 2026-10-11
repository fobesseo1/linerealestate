import {contentClient, originalsBucket, publicBucket} from "./client";
import {cleanContent, type Content, type Draft, type Revision} from "./types";
const db=()=>{const client=contentClient();if(!client)throw Error("자료 저장소 설정이 필요합니다.");return client;};
export async function loadDrafts():Promise<Draft[]>{const {data,error}=await db().from("lineestate_drafts").select("*").order("updated_at",{ascending:false});if(error)throw error;return data||[];}
export async function loadRevisions(id:string):Promise<Revision[]>{const {data,error}=await db().from("lineestate_revisions").select("*").eq("draft_id",id).order("created_at",{ascending:false});if(error)throw error;return data||[];}
export async function saveDraft(draft:Draft|null,content:Content,notes:string):Promise<Draft>{
 const fields={content:cleanContent(content),private_notes:notes,updated_at:new Date().toISOString()};
 const query=draft?db().from("lineestate_drafts").update({...fields,version:draft.version+1}).eq("id",draft.id).eq("version",draft.version):db().from("lineestate_drafts").insert(fields);
 const {data,error}=await query.select().single();if(error)throw Error("저장하지 못했습니다. 다른 곳에서 수정했는지 목록을 새로고침해 확인해 주세요.");return data;
}
export async function makeRevision(draft:Draft,candidate:Content,summary:string){
 const {data,error}=await db().from("lineestate_revisions").insert({draft_id:draft.id,base_version:draft.version,original:draft.content,candidate:cleanContent(candidate),summary}).select().single();if(error)throw error;return data as Revision;
}
export async function photoUrl(path:string){const {data,error}=await db().storage.from(originalsBucket).createSignedUrl(path,3600);if(error)throw error;return data.signedUrl;}
export async function uploadPhoto(file:File,draft:Draft){
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>15*1024*1024)throw Error("JPG·PNG·WebP 사진을 장당 15MB 이하로 올려주세요.");
 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[file.type];
 const path=`${draft.id}/${crypto.randomUUID()}.${ext}`;
 const {error}=await db().storage.from(originalsBucket).upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;
 return {path,label:file.name};
}
export async function approveRevision(revision:Revision){
 const published=[];
 for(const [i,photo] of revision.candidate.photos.entries()){
   if(!photo.path.startsWith(`${revision.draft_id}/`))throw Error("다른 매물의 사진은 게시할 수 없습니다.");
   const {data,error}=await db().storage.from(originalsBucket).download(photo.path);if(error)throw error;
   const path=`${revision.draft_id}/${revision.id}/${i}-${photo.path.split('/').pop()}`;
   const result=await db().storage.from(publicBucket).upload(path,data,{contentType:data.type,upsert:true});if(result.error)throw result.error;
   published.push({path,label:photo.label,url:db().storage.from(publicBucket).getPublicUrl(path).data.publicUrl});
 }
 const {error}=await db().rpc("lineestate_approve",{revision:revision.id,public_photos:published});if(error)throw Error(`게시하지 못했습니다: ${error.message}`);
}
export async function setPublicationStatus(id:string,status:string){const {data,error}=await db().from("lineestate_published").update({status}).eq("id",id).select("id").maybeSingle();if(error)throw error;if(!data)throw Error("아직 게시되지 않은 초안입니다. 게시 후 상태를 변경할 수 있습니다.");}
