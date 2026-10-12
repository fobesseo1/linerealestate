import {contentClient, originalsBucket, publicBucket} from "./client";
import {webpPhoto} from "./photo";
import {cleanContent, type Content, type Draft, type Revision} from "./types";
const db=()=>{const client=contentClient();if(!client)throw Error("자료 저장소 설정이 필요합니다.");return client;};
async function locateContent(input:Content,required=false):Promise<Content>{
 const content=cleanContent(input);delete content.latitude;delete content.longitude;
 if(!content.showMap)return content;
 if(!content.address.trim()){if(required)throw Error("지도에 표시할 건물 주소를 입력해 주세요.");return content;}
 try{
  const {data}=await db().auth.getSession();if(!data.session)throw Error("관리자 로그인이 필요합니다.");
  const response=await fetch("/api/content/map",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({address:content.address}),signal:AbortSignal.timeout(20000)});
  const position=await response.json();if(!response.ok)throw Error(position.error||"주소 위치를 확인하지 못했습니다.");
  if(!Number.isFinite(position.latitude)||!Number.isFinite(position.longitude))throw Error("주소 위치를 확인하지 못했습니다.");
  return {...content,latitude:position.latitude,longitude:position.longitude};
 }catch(error){if(required)throw error;return content;}
}
export async function loadDrafts():Promise<Draft[]>{const {data,error}=await db().from("lineestate_drafts").select("*").order("updated_at",{ascending:false});if(error)throw error;return data||[];}
export async function loadRevisions(id:string):Promise<Revision[]>{const {data,error}=await db().from("lineestate_revisions").select("*").eq("draft_id",id).order("created_at",{ascending:false});if(error)throw error;return data||[];}
export async function saveDraft(draft:Draft|null,content:Content,notes:string):Promise<Draft>{
 const fields={content:await locateContent(content),private_notes:notes,updated_at:new Date().toISOString()};
 const query=draft?db().from("lineestate_drafts").update({...fields,version:draft.version+1}).eq("id",draft.id).eq("version",draft.version):db().from("lineestate_drafts").insert(fields);
 const {data,error}=await query.select().single();if(error)throw Error("저장하지 못했습니다. 다른 곳에서 수정했는지 목록을 새로고침해 확인해 주세요.");return data;
}
export async function makeRevision(draft:Draft,candidate:Content,summary:string){
 const {data,error}=await db().from("lineestate_revisions").insert({draft_id:draft.id,base_version:draft.version,original:draft.content,candidate:await locateContent(candidate,true),summary}).select().single();if(error)throw error;return data as Revision;
}
export async function photoUrl(path:string){const {data,error}=await db().storage.from(originalsBucket).createSignedUrl(path,3600);if(error)throw error;return data.signedUrl;}
export async function uploadPhoto(file:File,draft:Draft){
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>15*1024*1024)throw Error("JPG·PNG·WebP 사진을 장당 15MB 이하로 올려주세요.");
 const processed=await webpPhoto(file);
 const processedPath=`${draft.id}/${crypto.randomUUID()}.webp`;
 const converted=await db().storage.from(originalsBucket).upload(processedPath,processed,{contentType:"image/webp",upsert:false});if(converted.error)throw converted.error;
 return {path:processedPath,label:file.name.replace(/\.[^.]+$/,".webp"),};
}
export async function approveRevision(revision:Revision){
 if(revision.candidate.showMap&&(!Number.isFinite(revision.candidate.latitude)||!Number.isFinite(revision.candidate.longitude)))throw Error("이전 게시안에는 지도 좌표가 없습니다. 입력창에서 게시안 확인을 다시 눌러 자동으로 위치를 확인해 주세요.");
 const published=[];
 for(const [i,photo] of revision.candidate.photos.entries()){
   if(!photo.path.startsWith(`${revision.draft_id}/`))throw Error("다른 매물의 사진은 게시할 수 없습니다.");
   const {data,error}=await db().storage.from(originalsBucket).download(photo.path);if(error)throw error;
   const processed=await webpPhoto(data);
   const path=`${revision.draft_id}/${revision.id}/${i}.webp`;
   const result=await db().storage.from(publicBucket).upload(path,processed,{contentType:"image/webp",upsert:true});if(result.error)throw result.error;
   published.push({path,label:photo.label,url:db().storage.from(publicBucket).getPublicUrl(path).data.publicUrl});
 }
 const {error}=await db().rpc("lineestate_approve",{revision:revision.id,public_photos:published});if(error)throw Error(`게시하지 못했습니다: ${error.message}`);
 window.dispatchEvent(new Event("lineestate-published"));
 try{localStorage.setItem("lineestate-publication-updated",String(Date.now()));}catch{}
}
export async function setPublicationStatus(id:string,status:string){const {data,error}=await db().from("lineestate_published").update({status}).eq("id",id).select("id").maybeSingle();if(error)throw error;if(!data)throw Error("아직 게시되지 않은 초안입니다. 게시 후 상태를 변경할 수 있습니다.");}
