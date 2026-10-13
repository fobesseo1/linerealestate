import type {Content, Publication} from "./types";

/** 10000 → "1억원", 25500 → "2억 5,500만원", "" → "미확인". Amounts are stored in 만원. */
export function price(value:string){
 if(value==="")return "미확인";
 const n=Number(value);
 if(n<10000)return `${n.toLocaleString("ko-KR")}만원`;
 const rest=Number((n%10000).toFixed(2));
 return `${Math.floor(n/10000).toLocaleString("ko-KR")}억${rest?` ${rest.toLocaleString("ko-KR")}만`:""}원`;
}

/** Detail fact tables list raw 만원 amounts. */
export const amount=(value:string)=>value===""?"미확인":`${Number(value).toLocaleString("ko-KR")}만원`;

export const floorLabel=(c:Content)=>c.floor?`${c.floor}${c.floor.endsWith("층")?"":"층"}`:"";
export const pyeong=(area:string)=>(Number(area)/3.3058).toFixed(1);
export const placeLabel=(c:Content)=>c.showMap?c.address:"군포·산본 · 상세 위치 상담";
export const isWork=(item:Publication)=>item.content.kind==="work";
export const detailHref=(item:Publication)=>`/${isWork(item)?"works":"property"}/${item.number}`;
