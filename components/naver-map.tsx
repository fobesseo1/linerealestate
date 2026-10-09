"use client";

import Script from "next/script";
import {useEffect, useRef, useState} from "react";
import {ExternalLink, MapPin} from "lucide-react";
import config from "@/lib/maps/public-config.json";
import {mapAddress} from "@/lib/maps/address.mjs";

type Position = {latitude:number; longitude:number; matchedAddress:string; verifiedAt:string};
type MapInstance = {destroy():void};
type MapsSDK = {
  LatLng: new (latitude:number, longitude:number) => object;
  Map: new (element:HTMLElement, options:object) => MapInstance;
  Marker: new (options:object) => {setMap(map:null):void};
};
type MapWindow = Window & {naver?:{maps:MapsSDK}; navermap_authFailure?:()=>void};

export function NaverMap({address, title, example=false}:{address:string; title:string; example?:boolean}) {
  // Query keys are generated from the original case addresses during preparation.
  const query = mapAddress(address);
  const position = (config.positions as Record<string, Position | null>)[query];
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim() || config.clientId;
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const link = `https://map.naver.com/p/search/${encodeURIComponent(query)}`;

  useEffect(() => {
    const target = window as MapWindow;
    const previous = target.navermap_authFailure;
    const fail = () => setError("지도를 표시하지 못했습니다. 아래 버튼으로 네이버 지도에서 위치를 확인해 주세요.");
    target.navermap_authFailure = fail;
    return () => {if (target.navermap_authFailure === fail) target.navermap_authFailure = previous;};
  }, []);

  useEffect(() => {
    if (!clientId || !position || ready || error) return;
    const timeout = setTimeout(() => setError("지도 연결이 지연되고 있습니다. 네이버 지도에서 위치를 확인해 주세요."), 15000);
    return () => clearTimeout(timeout);
  }, [clientId, position, ready, error]);

  useEffect(() => {
    const maps = (window as MapWindow).naver?.maps;
    if (!ready || error || !maps || !position || !container.current) return;
    const center = new maps.LatLng(position.latitude, position.longitude);
    const map = new maps.Map(container.current, {center, zoom:17, zoomControl:true, scrollWheel:false});
    const marker = new maps.Marker({map, position:center, title});
    return () => {marker.setMap(null); map.destroy();};
  }, [ready, error, position, title]);

  return <section className="property-map" aria-label={`${title} 위치`}>
    <div className="property-map-heading"><h2><MapPin size={18}/>{example ? "지도 예시" : "점포 위치"}</h2><span>{example ? "가상 매물 · 지도 예시 위치" : "실제 중개 완료 사례"}</span></div>
    <p className="property-map-address">{example ? `지도 확인용 주소: ${address} · 이 가상 매물의 실제 주소가 아닙니다.` : address}</p>
    <div className="property-map-frame">
      <div ref={container} className="property-map-canvas" aria-label={`${title} 네이버 지도`}/>
      {(!position || !clientId || error || !ready) && <div className="property-map-status" role="status"><MapPin size={24}/><p>{!position ? "주소 위치를 확인하지 못했습니다. 네이버 지도에서 주소를 검색해 주세요." : !clientId ? "네이버 지도에서 위치를 확인해 주세요." : error || "네이버 지도를 불러오는 중입니다…"}</p></div>}
    </div>
    <div className="property-map-footer"><small>{example ? "화면 구성 확인을 위한 산본 중심상가 예시 위치입니다." : "건물 위치를 표시합니다. 층·호수는 위 주소를 확인해 주세요."}</small><a href={link} target="_blank" rel="noopener noreferrer">네이버 지도로 이동 <ExternalLink size={14}/></a></div>
    {clientId && position && <Script id="naver-maps-sdk" src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`} strategy="afterInteractive" onReady={() => {
      if ((window as MapWindow).naver?.maps) setReady(true);
      else setError("지도를 초기화하지 못했습니다. 네이버 지도에서 위치를 확인해 주세요.");
    }} onError={() => setError("지도를 불러오지 못했습니다. 네이버 지도에서 위치를 확인해 주세요.")}/>}
  </section>;
}
