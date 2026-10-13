import type {Metadata} from "next";
import {notFound,permanentRedirect} from "next/navigation";
import {PropertyDetail} from "@/components/listings/property-detail";
import {getPublications} from "@/lib/content/public";
import {publicationMetadata} from "@/lib/content/metadata";

async function find(number:string){
 return (await getPublications())?.find(item=>item.number===number);
}

export async function generateMetadata({params}:PageProps<"/works/[number]">):Promise<Metadata>{
 const item=await find((await params).number);
 return item?publicationMetadata(item):{};
}

export default async function Page({params}:PageProps<"/works/[number]">){
 const {number}=await params;
 const item=await find(number);
 if(!item)notFound();
 if(item.content.kind!=="work")permanentRedirect(`/property/${number}`);
 return <PropertyDetail item={item}/>;
}
