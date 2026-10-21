"use client";

import Script from "next/script";
import {useEffect, useRef, useState} from "react";
import {ExternalLink, MapPin} from "lucide-react";
import {Button} from "@/components/ui/button";
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

export function NaverMap({address, title, caption="건물 위치", positionOverride}:{address:string; title:string; caption?:string; positionOverride?:{latitude:number;longitude:number}}) {
  // Query keys are generated from the original case addresses during preparation.
  const query = mapAddress(address);
  const position = positionOverride || (config.positions as Record<string, Position | null>)[query];
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
    let map:MapInstance | undefined;
    let removeMarker:(()=>void) | undefined;
    try {
      const center = new maps.LatLng(position.latitude, position.longitude);
      map = new maps.Map(container.current, {center, zoom:17, zoomControl:true, scrollWheel:false});
      const pin = new maps.Marker({map, position:center, title});
      removeMarker = () => pin.setMap(null);
    } catch {
      setError("지도를 초기화하지 못했습니다. 네이버 지도에서 위치를 확인해 주세요.");
    }
    return () => {
      // Authentication failure disposes the SDK before notifying our callback.
      // Its old instances can no longer safely call SDK methods at that point.
      if ((window as MapWindow).naver?.maps !== maps) return;
      try {removeMarker?.(); map?.destroy();} catch { /* Keep the property page usable if SDK cleanup fails. */ }
    };
  }, [ready, error, position?.latitude, position?.longitude, title]);

  return <section aria-label={`${title} 위치`} className="mb-8 mt-6 overflow-hidden border border-gray-200 bg-white">
    <div className="flex items-center justify-between gap-3 px-5 pt-5 max-sm:px-4 max-sm:pt-4"><h2 className="flex items-center gap-2 text-lead"><MapPin size={18}/>점포 위치</h2><span className="text-caption text-gray-600">{caption}</span></div>
    <p className="mb-4 mt-3 px-5 text-body text-gray-800 max-sm:px-4">{address}</p>
    <div className="relative bg-gray-50">
      <div ref={container} className="aspect-video w-full max-sm:aspect-[4/3]" aria-label={`${title} 네이버 지도`}/>
      {(!position || !clientId || error || !ready) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 p-6 text-center text-body text-gray-700" role="status"><MapPin size={24}/><p className="max-w-85">{!position ? "주소 위치를 확인하지 못했습니다. 네이버 지도에서 주소를 검색해 주세요." : !clientId ? "네이버 지도에서 위치를 확인해 주세요." : error || "네이버 지도를 불러오는 중입니다…"}</p></div>}
    </div>
    <div className="flex items-center justify-between gap-3 px-5 py-4 max-sm:flex-col max-sm:items-start"><small className="text-caption text-gray-600">건물 위치를 표시합니다. 층·호수는 위 주소를 확인해 주세요.</small><Button asChild variant="outline" size="sm" className="rounded-md border-gray-200 bg-white text-xs font-semibold text-ink"><a href={link} target="_blank" rel="noopener noreferrer">네이버 지도로 이동 <ExternalLink size={14}/></a></Button></div>
    {clientId && position && <Script id="naver-maps-sdk" src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`} strategy="afterInteractive" onReady={() => {
      if ((window as MapWindow).naver?.maps) setReady(true);
      else setError("지도를 초기화하지 못했습니다. 네이버 지도에서 위치를 확인해 주세요.");
    }} onError={() => setError("지도를 불러오지 못했습니다. 네이버 지도에서 위치를 확인해 주세요.")}/>}
  </section>;
}
