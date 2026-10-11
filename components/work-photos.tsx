"use client";
import {useState} from "react";
type WorkPhoto={src:string;label:string};
const asset=(path:string)=>`${process.env.NEXT_PUBLIC_BASE_PATH||""}${path}`;
export default function WorkPhotos({photos,name}:{photos:WorkPhoto[];name:string}){
 const [index,setIndex]=useState(0);
 const photo=photos[index]||photos[0];
 return <section className="gallery work-gallery" aria-label={`${name} 실제 사진`}><div className="gallery-main"><img src={asset(photo.src)} alt={photo.label}/><span className="photo-label">사용자 제공 · 실제 매장 사진</span><span className="photo-counter">{index+1} / {photos.length}</span></div><div className="gallery-thumbnails">{photos.map((p,i)=><button key={p.src} className={i===index?"selected":""} onClick={()=>setIndex(i)} aria-label={p.label} aria-pressed={i===index}><img src={asset(p.src)} alt={p.label}/><span>{p.label}</span></button>)}</div><p className="section-note">{photo.label} · 제공 당시 사진입니다.</p></section>;
}
