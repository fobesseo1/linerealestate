import type {Metadata} from "next";
import {notFound,permanentRedirect} from "next/navigation";
import {PropertyDetail} from "@/components/listings/property-detail";
import {getPublications} from "@/lib/content/public";
import {publicationMetadata} from "@/lib/content/metadata";
import {listingJsonLd} from "@/lib/seo";
import {site} from "@/lib/site";

async function find(number:string){
 return (await getPublications())?.find(item=>item.number===number);
}

export async function generateMetadata({params}:PageProps<"/property/[number]">):Promise<Metadata>{
 const item=await find((await params).number);
 return item?publicationMetadata(item):{};
}

export default async function Page({params}:PageProps<"/property/[number]">){
 const {number}=await params;
 const item=await find(number);
 if(!item)notFound();
 if(item.content.kind==="work")permanentRedirect(`/works/${number}`);
 const jsonLd=JSON.stringify(listingJsonLd(item,site.url)).replace(/</g,"\\u003c");
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd}}/><PropertyDetail item={item}/></>;
}
