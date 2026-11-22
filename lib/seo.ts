/**
 * Search-engine files and ownership tags (2026-11-22, docs/aws-이전-검색등록-계획.md 5단계).
 * Ownership codes are public values printed into the page, so they come from plain env names read at build time.
 * No imports here so `node --test` can load this file directly.
 */

/** robots.txt as text, so the Daum ownership comment can sit on the first line (Next's robots.ts cannot write comments). */
export function robotsText(siteUrl: string, daumToken?: string): string {
  const lines: string[] = [];
  const daum = daumToken?.trim();
  if (daum) lines.push(`#DaumWebMasterTool:${daum}`, "");
  lines.push("User-Agent: *", "Allow: /", "Disallow: /admin", "Disallow: /api", "", `Sitemap: ${siteUrl}/sitemap.xml`, "");
  return lines.join("\n");
}

type Env = Record<string, string | undefined>;

/** Next metadata.verification from env. Empty values are left out so no blank tags are printed. */
export function verificationMeta(env: Env): {google?: string; other?: Record<string, string>} | undefined {
  const pick = (name: string) => env[name]?.trim() || undefined;
  const google = pick("GOOGLE_SITE_VERIFICATION");
  const other: Record<string, string> = {};
  const naver = pick("NAVER_SITE_VERIFICATION");
  const bing = pick("BING_SITE_VERIFICATION");
  if (naver) other["naver-site-verification"] = naver;
  if (bing) other["msvalidate.01"] = bing;
  if (!google && !Object.keys(other).length) return undefined;
  return {...(google ? {google} : {}), ...(Object.keys(other).length ? {other} : {})};
}

// ---- Listings for search engines (docs/검색-등록-제안.md, 2026-11-22) ----
// Only the fields used here, so this file stays import-free. Amounts are stored in 만원.
type SeoContent = {
  kind: "lease" | "sale" | "work"; title: string; description: string; address: string; locality: string; showMap: boolean;
  deposit: string; rent: string; salePrice: string; area: string; floor: string; photos: {label: string; url?: string}[];
};
type SeoItem = {number: string; status: string; published_at: string; content: SeoContent};

const FILE_NAME = /\.(webp|jpe?g|png|gif|heic)$/i;
/** Photo alt text. Uploaded photos are often labelled with their file name; those read as "매물 제목 사진 n" instead. */
export function photoAlt(label: string, title: string, index: number): string {
  const clean = label.trim();
  return clean && !FILE_NAME.test(clean) ? `${title} - ${clean}` : `${title} 사진 ${index + 1}`;
}

const won = (manwon: string) => (manwon === "" || !Number.isFinite(Number(manwon)) ? undefined : Math.round(Number(manwon) * 10000));
const hrefOf = (item: SeoItem) => `/${item.content.kind === "work" ? "works" : "property"}/${item.number}`;
const kindName = {lease: "상가 임대", sale: "상가 매매", work: "중개 완료 사례"} as const;
const oneLine = (text: string, max: number) => {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

/**
 * schema.org data for one listing page: the listing itself (with only the values that were entered) and its breadcrumb.
 * The exact address appears only when the owner chose to publish it (showMap), matching what the page shows.
 */
export function listingJsonLd(item: SeoItem, siteUrl: string): object[] {
  const c = item.content;
  const url = `${siteUrl}${hrefOf(item)}`;
  const listPath = c.kind === "work" ? "/works" : "/listings";
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      {"@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/`},
      {"@type": "ListItem", position: 2, name: c.kind === "work" ? "중개 완료 사례" : "산본 상가 매물", item: `${siteUrl}${listPath}`},
      {"@type": "ListItem", position: 3, name: c.title, item: url},
    ],
  };
  if (c.kind === "work") return [breadcrumb];
  const images = c.photos.map(p => p.url).filter((u): u is string => !!u);
  const place: Record<string, unknown> = {"@type": "Place", address: {"@type": "PostalAddress", addressCountry: "KR", addressRegion: "경기도", addressLocality: "군포시", ...(c.showMap && c.address ? {streetAddress: c.address} : c.locality ? {streetAddress: c.locality} : {})}};
  const area = Number(c.area);
  if (c.area !== "" && area > 0) place.floorSize = {"@type": "QuantitativeValue", value: area, unitCode: "MTK"};
  const seller = {"@id": `${siteUrl}/#office`};
  const offer: Record<string, unknown> = {"@type": "Offer", priceCurrency: "KRW", availability: item.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut", seller, url};
  if (c.kind === "sale") {
    const p = won(c.salePrice);
    offer.businessFunction = "http://purl.org/goodrelations/v1#Sell";
    if (p !== undefined) offer.price = p;
  } else {
    offer.businessFunction = "http://purl.org/goodrelations/v1#LeaseOut";
    const rent = won(c.rent), deposit = won(c.deposit);
    const specs: object[] = [];
    if (rent !== undefined) specs.push({"@type": "UnitPriceSpecification", name: "월세", price: rent, priceCurrency: "KRW", unitCode: "MON"});
    if (deposit !== undefined) specs.push({"@type": "PriceSpecification", name: "보증금", price: deposit, priceCurrency: "KRW"});
    if (rent !== undefined) offer.price = rent;
    if (specs.length) offer.priceSpecification = specs;
  }
  const listing = {
    "@context": "https://schema.org", "@type": "RealEstateListing",
    "@id": `${url}#listing`, url, name: c.title, description: oneLine(c.description, 300),
    datePosted: item.published_at, ...(images.length ? {image: images} : {}),
    category: kindName[c.kind], about: place, offers: offer, provider: seller,
  };
  return [listing, breadcrumb];
}

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** RSS 2.0 of the newest listings and cases, for 네이버 서치어드바이저 and feed readers. */
export function rssXml(items: SeoItem[], siteUrl: string, siteName: string, limit = 50): string {
  const newest = [...items].sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, limit);
  const entries = newest.map(item => {
    const url = `${siteUrl}${hrefOf(item)}`;
    const c = item.content;
    return `<item><title>${xml(`${c.title} (${item.number})`)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid>` +
      `<category>${xml(kindName[c.kind])}</category><pubDate>${new Date(item.published_at).toUTCString()}</pubDate>` +
      `<description>${xml(oneLine(c.description, 200))}</description></item>`;
  }).join("");
  const updated = newest[0] ? new Date(newest[0].published_at).toUTCString() : new Date(0).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(`${siteName} 산본 상가 매물`)}</title>` +
    `<link>${xml(`${siteUrl}/`)}</link><description>${xml("산본중심상가 상가 임대·매매 매물과 중개 사례")}</description><language>ko</language>` +
    `<lastBuildDate>${updated}</lastBuildDate>${entries}</channel></rss>`;
}

/** IndexNow request body for a batch of page paths on this site (Bing, Naver, Yandex share submissions). */
export function indexNowBody(siteUrl: string, key: string, paths: string[]) {
  const host = new URL(siteUrl).host;
  const urlList = [...new Set(paths.filter(p => p.startsWith("/")).map(p => `${siteUrl}${p}`))].slice(0, 10000);
  return {host, key, keyLocation: `${siteUrl}/${key}.txt`, urlList};
}

/** IndexNow key. Public by design: the same value is served at /{key}.txt (public/) so engines can verify submissions. */
export const INDEXNOW_KEY = "01de395389bd8779a541f57f113486c9";

/** Submit only from the real public address; local, preview and the old Vercel host must not report URLs. */
export function canSubmitIndexNow(siteUrl: string): boolean {
  try { const u = new URL(siteUrl); return u.protocol === "https:" && !/vercel\.app$|localhost|127\.0\.0\.1/.test(u.hostname); } catch { return false; }
}
