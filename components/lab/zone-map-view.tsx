"use client";

import {useMemo, useState} from "react";
import {LabMap, type MapPoint, type MapPolygon} from "./lab-map";

type Zone = {no: string; name: string; color: string; ring: [number, number][]; listings: number; stores: number};
type Listing = {number: string; title: string; kindName: string; latitude: number; longitude: number; zone: string};

/** Zone polygons with listing pins and an in-zone / out-of-zone filter. */
export function ZoneMapView({zones, listings}: {zones: Zone[]; listings: Listing[]}) {
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [focus, setFocus] = useState(zones.find(z => z.listings)?.no ?? zones[0]?.no);
  const shown = listings.filter(l => filter === "all" || (filter === "in" ? l.zone : !l.zone));
  const polygons = useMemo<MapPolygon[]>(() => zones.map(z => ({id: z.no, ring: z.ring, color: z.color, name: z.name})), [zones]);
  const points = useMemo<MapPoint[]>(() => shown.map(l => ({id: l.number, lat: l.latitude, lon: l.longitude, color: l.zone ? "#19191F" : "#E00B41", title: `${l.number} ${l.title}`, big: true})), [shown]);
  const zone = zones.find(z => z.no === focus);
  const center = useMemo(() => {
    if (!zone) return {latitude: 37.3596, longitude: 126.9315};
    const lat = zone.ring.reduce((a, p) => a + p[1], 0) / zone.ring.length, lon = zone.ring.reduce((a, p) => a + p[0], 0) / zone.ring.length;
    return {latitude: lat, longitude: lon};
  }, [zone]);
  // Fallback-plot extent: the focused zone plus a margin.
  const span = zone ? Math.max(...zone.ring.map(([lon, lat]) => Math.max(Math.abs(lat - center.latitude) * 111000, Math.abs(lon - center.longitude) * 88300))) * 1.3 : undefined;

  return <div className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
    <div className="min-w-0 border border-gray-200 bg-white">
      <LabMap center={center} span={span} polygons={polygons} points={points} zoom={zone?.listings ? 17 : 16}/>
      <div className="flex flex-wrap gap-4 border-t border-gray-200 p-4 text-caption text-gray-900">
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-ink" aria-hidden/>상권 안 매물</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-brand" aria-hidden/>상권 밖 매물</span>
        <span>색 면 = 공단 발달상권 경계</span>
      </div>
    </div>
    <div className="grid min-w-0 content-start gap-4">
      <div className="min-w-0 border border-gray-200 bg-white p-4">
        <strong className="text-sm">상권으로 이동</strong>
        <ul className="mt-3 grid gap-2">{zones.map(z => <li key={z.no}>
          <button type="button" onClick={() => setFocus(z.no)} className={`flex w-full items-center gap-2 border p-3 text-left text-body ${focus === z.no ? "border-ink" : "border-gray-200"}`}>
            {/* Swatch colour matches the polygon colour drawn on the map. */}
            <span className="size-3 shrink-0" style={{background: z.color}} aria-hidden/>
            <span className="flex-1"><strong>{z.name}</strong><span className="block text-caption text-gray-800">등록 점포 {z.stores.toLocaleString()}곳 · 우리 매물 {z.listings}건</span></span>
          </button>
        </li>)}</ul>
      </div>
      <div className="min-w-0 border border-gray-200 bg-white p-4">
        <strong className="text-sm">매물 필터</strong>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([["all", "전체"], ["in", "상권 안"], ["out", "상권 밖"]] as const).map(([v, label]) =>
            <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)} className={`border py-2 text-xs ${filter === v ? "border-ink bg-ink text-white" : "border-gray-200"}`}>{label}</button>)}
        </div>
        <ul className="mt-3 max-h-80 divide-y divide-gray-100 overflow-y-auto text-body">
          {shown.map(l => <li key={l.number} className="py-2"><span className="text-caption text-gray-800">{l.number} · {l.kindName} · {l.zone || "상권 밖"}</span><p className="truncate">{l.title}</p></li>)}
        </ul>
      </div>
    </div>
  </div>;
}
