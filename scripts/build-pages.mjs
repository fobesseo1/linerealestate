// GitHub Pages cannot process inquiry POST requests. Keep old URLs working
// by forwarding them to the canonical Vercel site, preserving their hash.
import {mkdir,writeFile} from "node:fs/promises";
const output=".next-pages";
await mkdir(`${output}/admin`,{recursive:true});
function page(admin=false){return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><title>선부동산으로 이동</title><script>location.replace('https://linerealestate.vercel.app/${admin?'admin/':''}'+location.search+location.hash)</script><p><a href="https://linerealestate.vercel.app/${admin?'admin/':''}">선부동산 사이트로 이동</a></p></html>`;}
await writeFile(`${output}/index.html`,page());await writeFile(`${output}/404.html`,page());await writeFile(`${output}/admin/index.html`,page(true));
await writeFile(`${output}/.nojekyll`,"");
console.log("GitHub Pages links forward to the canonical Vercel website.");
