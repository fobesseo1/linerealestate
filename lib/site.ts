import {siteUrl} from "./site-url";

/**
 * Office facts shown on every public page. The legal fields must match the 중개사무소 등록증
 * exactly (공인중개사법 시행령 제17조의2제1항, 국토교통부 고시 「중개대상물의 표시·광고 명시사항 세부기준」 제3조·제4조).
 * See docs/advertising-compliance.md before changing any of them.
 */
export const site = {
  /** Brand used in the logo and page titles. Always shown together with `registeredName`. */
  name: "선부동산",
  /** From NEXT_PUBLIC_SITE_URL (lib/site-url.ts). */
  url: siteUrl,
  /** 등록증에 기재된 중개사무소 명칭 */
  registeredName: "선부동산공인중개사사무소",
  /** 중개사무소 등록번호 (군포시) */
  registrationNumber: "41410-2020-00001",
  /** 사업자등록번호 (안양세무서) */
  businessNumber: "377-03-01569",
  /** 개업공인중개사(대표자) 성명 */
  agent: "김영선",
  /** 등록증에 기재된 소재지 */
  address: "경기도 군포시 산본로323번길 16-15, 208호",
  postal: {region: "경기도", locality: "군포시", street: "산본로323번길 16-15, 208호", country: "KR"},
  /** Both numbers are registered with 군포시 as the office contact. */
  mobile: "010-6428-8020",
  mobileHref: "tel:01064288020",
  office: "031-344-8924",
  officeHref: "tel:0313448924",
  email: "ysyh1730@naver.com",
  /** Open every day, 24 hours (owner decision 2026-11-26). schema.org writes 24h as 00:00–23:59. */
  hours: [
    {days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], label: "매일", opens: "00:00", closes: "23:59"},
  ],
  hoursText: "연중무휴 24시간",
} as const;

/** schema.org RealEstateAgent for local search. Rendered once in the public layout. */
export function realEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${site.url}/#office`,
    name: site.registeredName,
    alternateName: site.name,
    url: site.url,
    logo: `${site.url}/logo.svg`,
    image: `${site.url}/logo.svg`,
    telephone: ["+82-31-344-8924", "+82-10-6428-8020"],
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: site.postal.country,
      addressRegion: site.postal.region,
      addressLocality: site.postal.locality,
      streetAddress: site.postal.street,
    },
    areaServed: "군포시 산본동",
    founder: {"@type": "Person", name: site.agent},
    openingHoursSpecification: site.hours.map(h => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}
