import {robotsText} from "@/lib/seo";
import {site} from "@/lib/site";

// Text instead of app/robots.ts so the Daum ownership line can be added (DAUM_WEBMASTER_TOKEN).
export const dynamic = "force-static";

export function GET() {
  return new Response(robotsText(site.url, process.env.DAUM_WEBMASTER_TOKEN), {
    headers: {"Content-Type": "text/plain; charset=utf-8"},
  });
}
