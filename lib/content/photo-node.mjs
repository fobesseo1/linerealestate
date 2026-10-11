import sharp from 'sharp';
export async function webpPhotoBuffer(input){
 const metadata=await sharp(input).metadata();
 if(metadata.format==='webp'&&Math.max(metadata.width,metadata.height)===1200&&!metadata.orientation)return input;
 const {data,info}=await sharp(input).rotate().resize(1200,1200,{fit:'inside',withoutEnlargement:false}).webp({quality:90}).toBuffer({resolveWithObject:true});
 if(info.format!=='webp'||Math.max(info.width,info.height)!==1200)throw Error('Photo normalization failed');
 return data;
}
