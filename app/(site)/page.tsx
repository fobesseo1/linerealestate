import {HomePage} from "@/components/home/home-page";
import {getDealRecords,getPublications} from "@/lib/content/public";

export default async function Page(){
 const [publications,records]=await Promise.all([getPublications(),getDealRecords()]);
 const months=(records||[]).map(r=>r.contracted_month).sort();
 return <HomePage initial={publications} records={{count:records?.length||0,since:months[0]?.slice(0,4)||""}}/>;
}
