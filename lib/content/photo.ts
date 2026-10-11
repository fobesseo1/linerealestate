// Resizing/format conversion only. Keep the original privately before using this output.
export async function webpPhoto(input:Blob):Promise<Blob>{
 const bitmap=await createImageBitmap(input,{imageOrientation:"from-image"});
 try{
  if(!bitmap.width||!bitmap.height)throw Error("사진 크기를 읽지 못했습니다.");
  if(input.type==="image/webp"&&Math.max(bitmap.width,bitmap.height)===1200)return input;
  const scale=1200/Math.max(bitmap.width,bitmap.height);
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const context=canvas.getContext("2d");if(!context)throw Error("사진 변환 기능을 사용할 수 없습니다.");
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const output=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?.type==="image/webp"?resolve(blob):reject(Error("이 브라우저에서 WebP 변환을 지원하지 않습니다.")),"image/webp",0.9));
  return output;
 }finally{bitmap.close();}
}
