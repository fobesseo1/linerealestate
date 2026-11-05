import {SiteShell} from "@/components/site/site-shell";
import {realEstateAgentJsonLd} from "@/lib/site";

export default function SiteLayout({children}:LayoutProps<"/">){
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(realEstateAgentJsonLd()).replace(/</g,"\\u003c")}}/>
  <SiteShell>{children}</SiteShell>
 </>;
}
