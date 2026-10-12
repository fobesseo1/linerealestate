import DesignLab from "@/components/design-lab";
import type {Metadata} from "next";
export const metadata:Metadata={title:"홈 디자인 비교 | 선부동산",robots:{index:false,follow:false}};
export default function Page(){return <DesignLab initial="balanced"/>;}
