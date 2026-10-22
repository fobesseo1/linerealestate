import {HomePage} from "@/components/home/home-page";
import {getDealRecords,getPublications} from "@/lib/content/public";

export default async function Page(){
 const [publications,records]=await Promise.all([getPublications(),getDealRecords()]);
 const since=(records||[]).map(r=>r.contracted_month).sort()[0]?.slice(0,4)||"";
 return <HomePage initial={publications} records={(records||[]).filter(r=>r.photo_path)} since={since}/>;
}
