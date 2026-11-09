import type {Content,Publication} from "./types";

const cardFields=["kind","industry","title","description","floor","area","deposit","rent","salePrice","premium","showMap","locality"] as const;

/** Only what the home and list screens draw. The detail page reads its full record on the server. */
export function toPublicCard({id,number,status,published_at,content:c}:Publication):Publication{
 const content:Partial<Content>={};
 for(const key of cardFields)if(c[key]!==undefined)Object.assign(content,{[key]:c[key]});
 if(c.showMap&&c.address)content.address=c.address;
 content.photos=c.photos.slice(0,1).map(({path,label,url})=>({path,label,url}));
 return {id,number,status,published_at,content:content as Content};
}
