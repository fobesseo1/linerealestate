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
