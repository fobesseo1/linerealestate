import {kindLabel,type Content} from "@/lib/content/types";

const labels:Partial<Record<keyof Content,string>>={kind:"분류",title:"제목",industry:"검토 업종",address:"주소",building:"건물·상호·호수",floor:"층",totalFloors:"전체 층",area:"전용면적",contractArea:"계약면적",deposit:"보증금",rent:"월세",salePrice:"매매가",premium:"권리금",management:"관리비",vat:"부가세",usage:"건축물 용도",approvedDate:"사용승인일",parking:"주차",direction:"방향",available:"입주 일정",description:"상세 설명",initial:"고객의 출발점",issue:"해결할 문제",actions:"협의 내용",outcome:"결과",facilities:"시설",showMap:"주소·지도 공개"};
function value(content:Content,key:keyof Content){
 if(key==="kind")return kindLabel[content.kind];
 if(key==="showMap")return content.showMap?"공개":"비공개";
 if(Array.isArray(content[key]))return (content[key] as string[]).join(" · ")||"미입력";
 const text=String(content[key]??"");
 return text===""?"미입력":text;
}
export default function RevisionChanges({original,candidate}:{original:Content;candidate:Content}){
 const changed=(Object.keys(labels) as (keyof Content)[]).filter(key=>JSON.stringify(original[key])!==JSON.stringify(candidate[key]));
 const before=new Set(original.photos.map(p=>p.path)),after=new Set(candidate.photos.map(p=>p.path));
 const added=candidate.photos.filter(p=>!before.has(p.path)).length,removed=original.photos.filter(p=>!after.has(p.path)).length;
 const reordered=original.photos.filter(p=>after.has(p.path)).map(p=>p.path).join()!==candidate.photos.filter(p=>before.has(p.path)).map(p=>p.path).join();
 const representative=original.photos[0]?.path!==candidate.photos[0]?.path;
 return <section className="admin-change-list" aria-label="실제 변경 사항"><h2>이번에 바뀐 내용</h2><div className="admin-change-badges"><span>항목 {changed.length}개 수정</span>{added>0&&<span>사진 {added}장 추가</span>}{removed>0&&<span>사진 {removed}장 제외</span>}{representative&&<span>대표 사진 변경</span>}{reordered&&<span>사진 순서 변경</span>}</div>{!changed.length&&!added&&!removed&&!representative&&!reordered&&<p>원본과 같은 게시안입니다. 내용이나 사진이 변경되지는 않았습니다.</p>}<dl>{changed.map(key=><div key={key}><dt>{labels[key]} <b>수정</b></dt><dd><span>변경 전</span><p>{value(original,key)}</p><span>변경 후</span><p className="admin-change-after">{value(candidate,key)}</p></dd></div>)}</dl></section>;
}
