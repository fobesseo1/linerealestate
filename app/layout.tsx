import type {Metadata} from "next";
import {site} from "@/lib/site";
import "./globals.css";

export const metadata:Metadata={
 metadataBase:new URL(site.url),
 title:{default:"선부동산 | 산본 상가를 가장 가까이에서",template:"%s | 선부동산"},
 description:"김영선 공인중개사와 함께 찾는 산본 상가. 임대차·상가 매매·중개 사례를 살펴보세요.",
 openGraph:{siteName:site.name,locale:"ko_KR",type:"website"},
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="ko"><body>{children}</body></html>;
}
