import type {Content, Publication} from "./types";

/** The one money format for the site. Amounts are stored in 만원: 10000 → "1억원", 25500 → "2억 5,500만원", 30 → "30만원", "" → "미확인". */
export function price(value:string){
 if(value==="")return "미확인";
 const n=Number(value);
 if(n<10000)return `${n.toLocaleString("ko-KR")}만원`;
 const rest=Number((n%10000).toFixed(2));
 return `${Math.floor(n/10000).toLocaleString("ko-KR")}억${rest?` ${rest.toLocaleString("ko-KR")}만`:""}원`;
}

export const floorLabel=(c:Content)=>c.floor?`${c.floor}${c.floor.endsWith("층")?"":"층"}`:"";
export const pyeong=(area:string)=>(Number(area)/3.3058).toFixed(1);
/** Public location. Hidden addresses fall back to the 읍·면·동 entered for the listing (고시 제6조제1호다목). */
export const placeLabel=(c:Content)=>c.showMap&&c.address?c.address:c.locality||"군포·산본 · 상세 위치 상담";
/** 거래 형태 as the 고시 requires: 임대차 is split into 월세 and 전세. */
export const dealForm=(c:Content)=>c.kind==="sale"?"매매":c.rent===""?"임대차":Number(c.rent)>0?"임대차(월세)":"임대차(전세)";
/** 중개대상물 종류: 건축물 용도, plus 위반건축물·미등기건물 when recorded. */
export const objectType=(c:Content)=>[c.usage,c.buildingStatus].filter(Boolean).join(" · ")||"미확인";
/** "3층 / 총 8층" */
export const floorsLabel=(c:Content)=>`${floorLabel(c)||"미확인"} / 총 ${c.totalFloors?`${c.totalFloors.replace(/층$/,"")}층`:"미확인"}`;
export const isWork=(item:Publication)=>item.content.kind==="work";
export const detailHref=(item:Publication)=>`/${isWork(item)?"works":"property"}/${item.number}`;

/** Ground floor, including split units such as "1·2층"; basements excluded. */
export const isGroundFloor=(c:Content)=>/^1(층)?($|·)/.test(c.floor.trim());
/** Key money explicitly entered as 0. A blank premium means unconfirmed, not none. */
export const noPremium=(c:Content)=>c.premium.trim()==="0";
