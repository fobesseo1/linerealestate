export type Kind = "lease" | "sale" | "work";
export type Photo = {path:string; label:string; url?:string; originalPath?:string};
export type Content = {
 kind:Kind; industry:string; title:string; address:string; building:string; floor:string; totalFloors:string;
 area:string; contractArea:string; deposit:string; rent:string; salePrice:string; premium:string; management:string;
 vat:string; usage:string; approvedDate:string; parking:string; direction:string; available:string;
 facilities:string[]; description:string; initial:string; issue:string; actions:string; outcome:string;
 photos:Photo[]; showMap:boolean; latitude?:number; longitude?:number;
};
export type Draft = {id:string;number:string;content:Content;private_notes:string;version:number;updated_at:string};
export type Revision = {id:string;draft_id:string;base_version:number;original:Content;candidate:Content;summary:string;state:string;created_at:string};
export type Publication = {id:string;number:string;content:Content;status:string;published_at:string};
export const kindLabel = {lease:"상가 임대",sale:"상가 매매",work:"중개 완료 사례"};
export const emptyContent = ():Content => ({kind:"lease",industry:"",title:"",address:"",building:"",floor:"",totalFloors:"",area:"",contractArea:"",deposit:"",rent:"",salePrice:"",premium:"",management:"",vat:"미확인",usage:"",approvedDate:"",parking:"",direction:"",available:"",facilities:[],description:"",initial:"",issue:"",actions:"",outcome:"",photos:[],showMap:false});
export const contentFields = ["kind","industry","title","address","building","floor","totalFloors","area","contractArea","deposit","rent","salePrice","premium","management","vat","usage","approvedDate","parking","direction","available","facilities","description","initial","issue","actions","outcome","photos","showMap","latitude","longitude"] as const;
export function cleanContent(input:Partial<Content>):Content {
 const result=emptyContent();
 for(const key of contentFields) if(input[key]!==undefined) Object.assign(result,{[key]:input[key]});
 if(!["lease","sale","work"].includes(result.kind)) throw Error("카테고리를 확인해 주세요.");
 for(const key of contentFields) if(typeof emptyContent()[key]==="string" && typeof result[key]!=="string") throw Error("입력 자료 형식을 확인해 주세요.");
 if(typeof result.showMap!=="boolean" || !Array.isArray(result.facilities) || result.facilities.some(x=>typeof x!=="string"))throw Error("시설·지도 항목 형식을 확인해 주세요.");
 if(!Array.isArray(result.photos) || result.photos.length>20 || result.photos.some(p=>typeof p.path!=="string"||typeof p.label!=="string"||p.path.includes("..")||p.path.startsWith("/")))throw Error("사진 정보를 확인해 주세요.");
 for(const key of ["area","contractArea","deposit","rent","salePrice","premium","management"] as const) if(result[key]!==""&&(!Number.isFinite(Number(result[key]))||Number(result[key])<0))throw Error("금액·면적은 0 이상의 숫자로 입력해 주세요. 미확인 항목은 비워둘 수 있습니다.");
 return result;
}
/** One brokered contract in the yearly record (lineestate_deal_records). */
export type DealRecord = {id:string;contracted_month:string;name:string;industry:string;deal_type:"lease"|"sale"|"transfer";map_url:string;case_number:string;sort_order:number;visible:boolean;photo_path:string;updated_at:string};
export const dealTypeLabel = {lease:"임대차",sale:"매매",transfer:"양도양수"};
