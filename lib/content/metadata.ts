import type {Metadata} from "next";
import {kindLabel,type Publication} from "./types";
import {detailHref,price} from "./format";

/** Title, description and share preview for a listing or case page. */
export function publicationMetadata(item:Publication):Metadata{
 const c=item.content;
 const terms=c.kind==="sale"?`매매 ${price(c.salePrice)}`:c.kind==="lease"?`보증금 ${price(c.deposit)} / 월세 ${price(c.rent)}`:"";
 const description=[kindLabel[c.kind],terms,c.description.replace(/\s+/g," ").slice(0,110)].filter(Boolean).join(" · ");
 const image=c.photos[0]?.url;
 return {
  title:`${c.title} (${item.number})`,
  description,
  alternates:{canonical:detailHref(item)},
  openGraph:{title:c.title,description,url:detailHref(item),images:image?[{url:image,alt:c.title}]:undefined},
 };
}
