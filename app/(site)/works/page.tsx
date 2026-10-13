import type {Metadata} from "next";
import {WorksView} from "@/components/listings/listings-view";
import {getPublications} from "@/lib/content/public";

export const metadata:Metadata={title:"중개 완료 사례",description:"김영선 공인중개사가 계약부터 오픈까지 함께한 산본 상가 중개 사례입니다."};

export default async function Page(){
 return <WorksView initial={await getPublications()}/>;
}
