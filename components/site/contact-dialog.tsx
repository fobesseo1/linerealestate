"use client";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "@/components/ui/dialog";
import {InquiryForm} from "@/components/inquiry/inquiry-form";
import {useSite} from "./site-context";

const titles={general:"내 조건에 맞는 점포를 요청하세요",listing:"이 매물에 대해 문의하세요",work:"비슷한 고민을 알려주세요",landlord:"내 점포의 임대 조건을 알려주세요"};

export function ContactDialog(){
 const {contact,closeContact}=useSite();
 return <Dialog open={!!contact} onOpenChange={open=>{if(!open)closeContact();}}>
  {contact&&<DialogContent>
   <DialogTitle>{titles[contact.kind]}</DialogTitle>
   <DialogDescription>
    김영선 공인중개사가 확인 후 최대한 빨리 연락드립니다.
    {contact.title&&<><br/>{contact.title}{contact.reference&&` · ${contact.reference}`}</>}
   </DialogDescription>
   <InquiryForm key={`${contact.kind}-${contact.reference||contact.goal}`} context={contact}/>
  </DialogContent>}
 </Dialog>;
}
