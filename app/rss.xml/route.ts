import {getPublications} from "@/lib/content/public";
import {rssXml} from "@/lib/seo";
import {site} from "@/lib/site";

// Newest listings and cases for 네이버 서치어드바이저 (RSS 제출). Same 30-second freshness as the sitemap.
export const revalidate = 30;

export async function GET() {
  const items = await getPublications();
  if (items === null) return new Response("", {status: 503, headers: {"Cache-Control": "no-store"}});
  return new Response(rssXml(items, site.url, site.name), {
    headers: {"Content-Type": "application/rss+xml; charset=utf-8"},
  });
}
