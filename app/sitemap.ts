import type {MetadataRoute} from "next";
import {getPublications} from "@/lib/content/public";
import {detailHref} from "@/lib/content/format";
import {site} from "@/lib/site";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const pages=["/","/listings","/works","/compare","/process"].map(path=>({url:`${site.url}${path}`}));
 const items=(await getPublications())||[];
 return [...pages,...items.map(item=>({url:`${site.url}${detailHref(item)}`,lastModified:item.published_at}))];
}
