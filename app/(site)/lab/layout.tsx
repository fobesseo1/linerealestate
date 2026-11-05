import type {Metadata} from "next";

// Lab pages are for internal testing of 상권 data ideas; keep them out of search results.
// Render on request; the pages read query parameters and a bundled data snapshot.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {title: {template: "%s · 상권 데이터 테스트", default: "상권 데이터 테스트"}, robots: {index: false, follow: false}};

export default function LabLayout({children}: LayoutProps<"/lab">) {
  return <div className="page min-h-[65vh] pb-18">{children}</div>;
}
