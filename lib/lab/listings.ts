import {getPublications} from "@/lib/content/public";
import {kindLabel, type Kind} from "@/lib/content/types";

/** A published listing or case that has map coordinates. */
export type LabListing = {number: string; title: string; kind: Kind; kindName: string; industry: string; address: string; latitude: number; longitude: number};

export async function labListings(): Promise<LabListing[]> {
  const rows = (await getPublications()) ?? [];
  return rows.flatMap(r => {
    const c = r.content, latitude = Number(c.latitude), longitude = Number(c.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !c.latitude) return [];
    return [{number: r.number, title: c.title, kind: c.kind, kindName: kindLabel[c.kind], industry: c.industry, address: c.address, latitude, longitude}];
  }).sort((a, b) => a.number.localeCompare(b.number));
}

/** Reads a single query value from Next.js searchParams. */
export function param(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) || undefined;
}

/** Rough keyword match from a listing's free-text industry to a 중분류 code. */
const KEYWORDS: [RegExp, string][] = [
  [/PC카페|PC방|노래방|노래연습장/i, "R104"], [/카페|커피/, "I212"], [/중식|짬뽕/, "I202"], [/일식|이자카야|주점|펍/, "I211"], [/치킨|통닭/, "I210"],
  [/미용|뷰티|네일|피부/, "S207"], [/학원|교육/, "P105"], [/이비인후과|의원|병원|의료/, "Q102"],
  [/음식|한식/, "I201"], [/사무실/, "M107"],
];
export function guessCategory(industry: string) {
  return KEYWORDS.find(([re]) => re.test(industry))?.[1];
}

/** Picks the 소분류 name that the listing's industry text mentions, else the most common one. */
export function pickSmall(industry: string, names: string[]) {
  return names.find(n => n.split("/").some(part => part.length > 1 && industry.includes(part.replace(/(실|숍|점|업)$/, "")))) ?? names[0];
}
