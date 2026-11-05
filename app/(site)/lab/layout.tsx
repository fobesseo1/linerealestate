import type {Metadata} from "next";

// Lab pages are for internal testing of 상권 data ideas; keep them out of search results.
// Render on request so a slow or failing public-data API never blocks a site build.
// A cold start fetches about 10 API pages one by one, so allow up to a minute.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {title: {template: "%s · 상권 데이터 테스트", default: "상권 데이터 테스트"}, robots: {index: false, follow: false}};

export default function LabLayout({children}: LayoutProps<"/lab">) {
  return <div className="page min-h-[65vh] pb-18">{children}</div>;
}
