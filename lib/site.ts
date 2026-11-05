/**
 * Office facts shown on every public page. The legal fields must match the 중개사무소 등록증
 * exactly (공인중개사법 시행령 제17조의2제1항, 국토교통부 고시 「중개대상물의 표시·광고 명시사항 세부기준」 제3조·제4조).
 * See docs/advertising-compliance.md before changing any of them.
 */
export const site = {
  /** Brand used in the logo and page titles. Always shown together with `registeredName`. */
  name: "선부동산",
  url: "https://linerealestate.vercel.app",
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
  /** Provisional hours confirmed by the owner on 2026-11-05. */
  hours: [
    {days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], label: "평일", opens: "09:30", closes: "18:30"},
    {days: ["Saturday"], label: "토", opens: "10:00", closes: "15:00"},
  ],
  hoursText: "평일 09:30–18:30 · 토 10:00–15:00 · 일·공휴일 휴무",
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
