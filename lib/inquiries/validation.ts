export function validateInquiry(input:Record<string,unknown>){
 const value=(name:string,max:number)=>{const raw=input[name];if(raw!==undefined&&typeof raw!=="string")throw Error("문의 내용을 확인해 주세요.");const text=(raw as string||"").trim();if(text.length>max)throw Error("문의 내용이 너무 깁니다.");return text;};
 const phone=value("phone",24).replace(/[\s()-]/g,"");
 if(!/^(?:0\d{8,10}|\+\d{8,15})$/.test(phone))throw Error("연락받을 전화번호를 확인해 주세요.");
 if(input.consent!==true)throw Error("상담 정보 제공에 동의해 주세요.");
 const kind=value("kind",20);if(!["general","listing","work","landlord"].includes(kind))throw Error("상담 분야를 확인해 주세요.");
 const reference=value("reference",40);if(reference&&!/^SUN-\d+$/.test(reference))throw Error("매물번호를 확인해 주세요.");
 const requestId=value("requestId",36);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))throw Error("다시 접수해 주세요.");
 return {requestId,kind,phone,reference,title:value("title",200),goal:value("goal",200),industry:value("industry",100),message:value("message",1000),time:value("time",100)};
}
