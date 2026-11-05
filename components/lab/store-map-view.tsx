"use client";

import {useCallback, useMemo, useState} from "react";
import {LARGE_COLORS, LabMap, type MapPoint} from "./lab-map";
import type {Store} from "@/lib/lab/store-data";

type Center = {latitude: number; longitude: number; title: string};

/** Category chips over a map: choosing a category shows its stores as pins. */
export function StoreMapView({center, radius, stores, initial}: {center: Center; radius: number; stores: Store[]; initial: string}) {
  const categories = useMemo(() => {
    const map = new Map<string, {code: string; name: string; lc: string; count: number}>();
    for (const s of stores) {
      const row = map.get(s.mc) ?? {code: s.mc, name: s.mcn, lc: s.lc, count: 0};
      row.count++; map.set(s.mc, row);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [stores]);
  const [chosen, setChosen] = useState<string[]>(categories.some(c => c.code === initial) ? [initial] : categories.slice(0, 1).map(c => c.code));
  const [selected, setSelected] = useState<Store | null>(null);

  const visible = useMemo(() => stores.filter(s => chosen.includes(s.mc)), [stores, chosen]);
  const points = useMemo<MapPoint[]>(() => [
    ...visible.map(s => ({id: s.id, lat: s.lat, lon: s.lon, color: LARGE_COLORS[s.lc] ?? "#333", title: `${s.name} · ${s.scn}`})),
    {id: "listing", lat: center.latitude, lon: center.longitude, color: "#19191F", title: center.title, label: "이 매물"},
  ], [visible, center]);
  const onSelect = useCallback((id: string) => setSelected(stores.find(s => s.id === id) ?? null), [stores]);
  const toggle = (code: string) => setChosen(now => now.includes(code) ? now.filter(c => c !== code) : [...now, code]);

  return <div className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
    <div className="min-w-0 border border-gray-200 bg-white">
      <LabMap center={center} radius={radius} points={points} onSelect={onSelect} zoom={radius > 300 ? 16 : 17}/>
      <div className="min-h-16 border-t border-gray-200 p-4 text-body">
        {selected ? <><strong>{selected.name}{selected.branch && ` ${selected.branch}`}</strong><p className="mt-1 text-gray-800">{selected.scn} · {selected.building || selected.road}{selected.floor && ` ${selected.floor}층`}</p></>
          : <p className="text-gray-700">핀을 누르면 점포 이름과 층이 여기에 나옵니다. 지금 {visible.length.toLocaleString()}곳 표시 중.</p>}
      </div>
    </div>
    <div className="min-w-0 border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between"><strong className="text-sm">업종 필터 (중분류)</strong>
        <button type="button" className="text-caption text-gray-800 underline" onClick={() => setChosen([])}>모두 해제</button></div>
      <div className="flex max-h-130 flex-wrap gap-2 overflow-y-auto max-lg:max-h-60">
        {categories.map(c => {
          const on = chosen.includes(c.code);
          return <button key={c.code} type="button" aria-pressed={on} onClick={() => toggle(c.code)}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-xs ${on ? "border-ink bg-ink text-white" : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"}`}>
            {/* Dot colour follows the 대분류 pin colour on the map. */}
            <span className="size-2 rounded-full" style={{background: LARGE_COLORS[c.lc] ?? "#333"}} aria-hidden/>{c.name} {c.count}
          </button>;
        })}
      </div>
    </div>
  </div>;
}
