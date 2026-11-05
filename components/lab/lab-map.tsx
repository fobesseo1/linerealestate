"use client";

// Test-only Naver map that can draw a radius circle, polygons and many small pins.
// Marker HTML and colours are data-driven, so they use inline styles inside the SDK content.
import Script from "next/script";
import {useEffect, useRef, useState} from "react";
import config from "@/lib/maps/public-config.json";

export type MapPoint = {id: string; lat: number; lon: number; color: string; title: string; big?: boolean; label?: string};
export type MapPolygon = {id: string; ring: [number, number][]; color: string; name: string};

type SDK = {
  LatLng: new (lat: number, lon: number) => object;
  Point: new (x: number, y: number) => object;
  Map: new (el: HTMLElement, opts: object) => {destroy(): void; setCenter(c: object): void};
  Marker: new (opts: object) => {setMap(m: null): void};
  Circle: new (opts: object) => {setMap(m: null): void};
  Polygon: new (opts: object) => {setMap(m: null): void};
  Event: {addListener(target: object, name: string, fn: () => void): void};
};
type W = Window & {naver?: {maps: SDK}};

export function LabMap({center, radius, points, polygons = [], zoom = 17, onSelect, className, span}: {
  center: {latitude: number; longitude: number}; radius?: number; points: MapPoint[]; polygons?: MapPolygon[]; zoom?: number;
  onSelect?: (id: string) => void; className?: string; /** Half-width in metres for the fallback plot. */ span?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<InstanceType<SDK["Map"]> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim() || config.clientId;

  useEffect(() => {
    const target = window as W & {navermap_authFailure?: () => void};
    const previous = target.navermap_authFailure;
    const fail = () => setError("auth");
    target.navermap_authFailure = fail;
    if (target.naver?.maps) setReady(true);
    return () => { if (target.navermap_authFailure === fail) target.navermap_authFailure = previous; };
  }, []);

  useEffect(() => {
    const maps = (window as W).naver?.maps;
    if (!ready || !maps || !box.current) return;
    try { map.current = new maps.Map(box.current, {center: new maps.LatLng(center.latitude, center.longitude), zoom, zoomControl: true, zoomControlOptions: {style: (maps as unknown as {ZoomControlStyle?: {SMALL: number}}).ZoomControlStyle?.SMALL}, scrollWheel: false}); }
    catch { setError("지도를 초기화하지 못했습니다."); }
    return () => { try { map.current?.destroy(); } catch { /* SDK already disposed. */ } map.current = null; };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const maps = (window as W).naver?.maps;
    if (!maps || !map.current || error) return;
    const drawn: {setMap(m: null): void}[] = [];
    try { draw(maps, map.current, drawn); } catch { /* SDK disposed after an auth failure; the fallback plot takes over. */ }
    return () => { if ((window as W).naver?.maps === maps) drawn.forEach(d => { try { d.setMap(null); } catch { /* ignore */ } }); };
  }, [ready, error, center.latitude, center.longitude, radius, points, polygons, onSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  function draw(maps: SDK, target: InstanceType<SDK["Map"]>, drawn: {setMap(m: null): void}[]) {
    map.current = target;
    map.current.setCenter(new maps.LatLng(center.latitude, center.longitude));
    if (radius) drawn.push(new maps.Circle({map: map.current, center: new maps.LatLng(center.latitude, center.longitude), radius, strokeColor: "#E00B41", strokeWeight: 2, strokeOpacity: .8, fillColor: "#E00B41", fillOpacity: .04}));
    for (const p of polygons) drawn.push(new maps.Polygon({map: map.current, paths: [p.ring.map(([lon, lat]) => new maps.LatLng(lat, lon))], strokeColor: p.color, strokeWeight: 2, fillColor: p.color, fillOpacity: .12, title: p.name}));
    for (const p of points) {
      const size = p.big ? 18 : 10;
      const content = p.label
        ? `<div style="transform:translate(-50%,-100%);white-space:nowrap;background:${p.color};color:#fff;font:700 11px Pretendard,sans-serif;padding:3px 6px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)">${p.label.replace(/</g, "&lt;")}</div>`
        : `<div title="${p.title.replace(/"/g, "&quot;")}" style="width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;border-radius:50%;background:${p.color};border:2px solid #fff;box-shadow:0 1px 2px rgba(0,0,0,.4)"></div>`;
      const marker = new maps.Marker({map: map.current, position: new maps.LatLng(p.lat, p.lon), title: p.title, icon: {content}, zIndex: p.big || p.label ? 100 : 10});
      if (onSelect) maps.Event.addListener(marker, "click", () => onSelect(p.id));
      drawn.push(marker);
    }
  }

  return <div className={`relative bg-gray-50 ${className ?? "aspect-[4/3] w-full"}`}>
    {/* The SDK rewrites this box to position:relative, so it needs its own full height. */}
    <div ref={box} className={`absolute inset-0 h-full w-full ${error ? "invisible" : ""}`}/>
    {error ? <FallbackPlot center={center} radius={radius} span={span} points={points} polygons={polygons} onSelect={onSelect} reason={error}/>
      : !ready && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-body text-gray-700" role="status">네이버 지도를 불러오는 중입니다…</p>}
    <Script id="naver-maps-sdk" src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`} strategy="afterInteractive"
      onReady={() => (window as W).naver?.maps ? setReady(true) : setError("지도를 불러오지 못했습니다.")} onError={() => setError("지도를 불러오지 못했습니다.")}/>
    {/* Fallback plot is drawn in an SVG whose colours come from data, which Tailwind classes cannot express. */}
  </div>;
}

/**
 * Plain coordinate plot used when the Naver map cannot load (for example on localhost,
 * which is not registered for the map client ID). No base map, but the same points and shapes.
 */
function FallbackPlot({center, radius, points, polygons, onSelect, reason, span}: {
  center: {latitude: number; longitude: number}; radius?: number; span?: number; points: MapPoint[]; polygons: MapPolygon[]; onSelect?: (id: string) => void; reason: string;
}) {
  const W = 800, H = 600, mPerLat = 111000, mPerLon = 111000 * Math.cos(center.latitude * Math.PI / 180);
  const xs = [...points.map(p => p.lon), ...polygons.flatMap(p => p.ring.map(r => r[0]))];
  const ys = [...points.map(p => p.lat), ...polygons.flatMap(p => p.ring.map(r => r[1]))];
  const half = span ?? (radius ? radius * 1.15 : Math.max(150, ...xs.map(x => Math.abs(x - center.longitude) * mPerLon), ...ys.map(y => Math.abs(y - center.latitude) * mPerLat)) * 1.1);
  const scale = Math.min(W, H) / 2 / half;
  const x = (lon: number) => W / 2 + (lon - center.longitude) * mPerLon * scale;
  const y = (lat: number) => H / 2 - (lat - center.latitude) * mPerLat * scale;
  return <div className="absolute inset-0 flex flex-col bg-white">
    <svg viewBox={`0 0 ${W} ${H}`} className="min-h-0 flex-1" role="img" aria-label="점포 위치 간이 그림">
      <rect width={W} height={H} fill="#F7F7F7"/>
      {polygons.map(p => <polygon key={p.id} points={p.ring.map(([lon, lat]) => `${x(lon)},${y(lat)}`).join(" ")} fill={p.color} fillOpacity={.15} stroke={p.color} strokeWidth={2}><title>{p.name}</title></polygon>)}
      {radius && <circle cx={W / 2} cy={H / 2} r={radius * scale} fill="#E00B41" fillOpacity={.04} stroke="#E00B41" strokeWidth={2} strokeDasharray="6 4"/>}
      {points.filter(p => !p.label).map(p => <circle key={p.id} cx={x(p.lon)} cy={y(p.lat)} r={p.big ? 8 : 5} fill={p.color} stroke="#fff" strokeWidth={1.5} className={onSelect ? "cursor-pointer" : ""} onClick={() => onSelect?.(p.id)}><title>{p.title}</title></circle>)}
      {points.filter(p => p.label).map(p => <g key={p.id}><circle cx={x(p.lon)} cy={y(p.lat)} r={9} fill={p.color} stroke="#fff" strokeWidth={3}/><text x={x(p.lon)} y={y(p.lat) - 14} textAnchor="middle" fontSize={16} fontWeight={700} fill={p.color}>{p.label}</text></g>)}
      {radius && <text x={W / 2 + radius * scale - 4} y={H / 2 - 6} textAnchor="end" fontSize={14} fill="#E00B41">{radius}m</text>}
    </svg>
    <p className="border-t border-gray-200 px-3 py-2 text-caption text-gray-800" role="status">
      {reason === "auth" ? "네이버 지도 인증에 실패해 배경 지도 없이 좌표만 그렸습니다. 네이버 클라우드 콘솔의 지도 Web 서비스 URL에 이 주소(예: http://localhost:3010)를 등록하면 실제 지도가 나옵니다." : `${reason} 배경 지도 없이 좌표만 그렸습니다.`}
    </p>
  </div>;
}

/** One colour per 대분류 so pins can be told apart. */
export const LARGE_COLORS: Record<string, string> = {
  I2: "#E00B41", G2: "#2563EB", S2: "#9333EA", P1: "#059669", Q1: "#0891B2",
  R1: "#D97706", M1: "#64748B", L1: "#78716C", N1: "#A3A3A3", I1: "#DB2777",
};
