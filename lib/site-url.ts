/**
 * The site's public address in one place (2026-11-22, docs/aws-이전-검색등록-계획.md).
 * Vercel keeps the old address until the move; the AWS server sets NEXT_PUBLIC_SITE_URL to the new one.
 * No imports here so `node --test` can load this file directly.
 */
export const LEGACY_ORIGIN = "https://linerealestate.vercel.app";
export const NEW_ORIGIN = "https://sanbon.lineestate.co.kr";
export const LOCAL_ORIGIN = "http://localhost:3010";

/** Normalizes NEXT_PUBLIC_SITE_URL. Anything that is not a bare https origin (or the local dev origin) falls back to the old address. */
export function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim().replace(/\/+$/, "");
  if (!value) return LEGACY_ORIGIN;
  try {
    const url = new URL(value);
    if (url.origin !== value) return LEGACY_ORIGIN;
    if (url.protocol === "https:" || value === LOCAL_ORIGIN) return value;
  } catch {}
  return LEGACY_ORIGIN;
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Origins allowed to post to this site's APIs. Both addresses stay allowed while the move is in progress. */
export function allowedOrigins(current: string = siteUrl, nodeEnv: string | undefined = process.env.NODE_ENV): string[] {
  const list = new Set([current, LEGACY_ORIGIN, NEW_ORIGIN]);
  if (nodeEnv !== "production") list.add(LOCAL_ORIGIN);
  return [...list];
}

export function isAllowedOrigin(origin: string | null, current: string = siteUrl, nodeEnv: string | undefined = process.env.NODE_ENV): boolean {
  return !!origin && allowedOrigins(current, nodeEnv).includes(origin);
}
