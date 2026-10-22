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
export const placeLabel=(c:Content)=>c.showMap?c.address:"군포·산본 · 상세 위치 상담";
export const isWork=(item:Publication)=>item.content.kind==="work";
export const detailHref=(item:Publication)=>`/${isWork(item)?"works":"property"}/${item.number}`;

/** Ground floor, including split units such as "1·2층"; basements excluded. */
export const isGroundFloor=(c:Content)=>/^1(층)?($|·)/.test(c.floor.trim());
/** Key money explicitly entered as 0. A blank premium means unconfirmed, not none. */
export const noPremium=(c:Content)=>c.premium.trim()==="0";
