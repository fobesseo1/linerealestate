import DesignLab from "@/components/design-lab";
import type {Metadata} from "next";
export const metadata:Metadata={title:"D 균형형 · 캐릭터 추가 | 선부동산 테스트",robots:{index:false,follow:false}};
export default function Page(){return <DesignLab initial="balanced" characters/>;}
