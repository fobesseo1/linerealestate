import {HomePage} from "@/components/home/home-page";
import {getPublications} from "@/lib/content/public";

export default async function Page(){
 return <HomePage initial={await getPublications()}/>;
}
