// GitHub Pages cannot process inquiry POST requests. Keep old URLs working
// by forwarding them to the canonical Vercel site, preserving their hash.
import {mkdir,writeFile} from "node:fs/promises";
// Same rule as lib/site-url.ts: NEXT_PUBLIC_SITE_URL, else the old Vercel address. Set the repository variable after the move.
const origin=(process.env.NEXT_PUBLIC_SITE_URL||"https://linerealestate.vercel.app").trim().replace(/\/+$/,"");
const output=".next-pages";
await mkdir(`${output}/admin`,{recursive:true});
function page(admin=false){return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><title>선부동산으로 이동</title><script>location.replace('${origin}/${admin?'admin/':''}'+location.search+location.hash)</script><p><a href="${origin}/${admin?'admin/':''}">선부동산 사이트로 이동</a></p></html>`;}
await writeFile(`${output}/index.html`,page());await writeFile(`${output}/404.html`,page());await writeFile(`${output}/admin/index.html`,page(true));
await writeFile(`${output}/.nojekyll`,"");
console.log("GitHub Pages links forward to the canonical Vercel website.");
