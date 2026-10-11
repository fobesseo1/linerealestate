import type {Metadata} from "next";
import AdminApp from "@/components/admin/admin-app";
export const metadata:Metadata={title:"매물 관리 | 선부동산",robots:{index:false,follow:false}};
export default function AdminPage(){return <AdminApp/>;}
