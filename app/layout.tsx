import type {Metadata} from "next";
import {site} from "@/lib/site";
import {verificationMeta} from "@/lib/seo";
import "./globals.css";

export const metadata:Metadata={
 metadataBase:new URL(site.url),
 title:{default:"산본중심상가 상가 임대·매매 | 선부동산",template:"%s | 선부동산"},
 description:"김영선 공인중개사와 함께 찾는 산본 상가. 임대차·상가 매매·중개 사례를 살펴보세요.",
 openGraph:{siteName:site.name,locale:"ko_KR",type:"website"},
 verification:verificationMeta(process.env),
 alternates:{types:{"application/rss+xml":[{url:"/rss.xml",title:"선부동산 산본 상가 매물"}]}},
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="ko"><body>{children}</body></html>;
}
