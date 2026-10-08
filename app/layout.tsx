import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "선부동산 | 산본 상가를 가장 가까이에서", description: "김영선 공인중개사와 함께 찾는 산본 상가. 임대차·상가 매매·중개 사례를 살펴보세요. 시연용 사이트입니다." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
