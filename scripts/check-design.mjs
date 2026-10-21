// Enforces DESIGN.md. Runs before every `npm run build`, so a violation stops the deploy.
// A deliberate exception needs `design-exception: <reason>` on the same line (JSX: {/* design-exception: … */}).
import {readdir,readFile} from "node:fs/promises";
import {join,relative,sep} from "node:path";

const roots=["app","components","lib"];
const allowedCss=new Set(["app/globals.css","components/admin/admin.css"]);
const legacyAdmin="components/admin/";
const bannedPackages=/from\s+["'](@mui\/|antd|@chakra-ui\/|styled-components|@emotion\/|bootstrap|react-bootstrap|@mantine\/)/;

const rules=[
 {id:"font",test:(line,file)=>file!=="app/globals.css"&&/(font-family\s*:|fontFamily\s*:|\bfont-\[)/.test(line),
  message:"글꼴은 Pretendard 하나만 씁니다. font-family·fontFamily·font-[…]를 따로 지정하지 마세요."},
 {id:"tracking",test:(line,file)=>file!=="app/globals.css"&&(/letter-spacing\s*:|letterSpacing\s*:/.test(line)||/\btracking-(?!normal\b|eyebrow\b)[\w[-]/.test(line)),
  message:"자간은 사이트 전체 -2%(기본값)입니다. tracking-eyebrow 외의 tracking·letter-spacing을 쓰지 마세요."},
 {id:"inline-style",test:line=>/style=\{\{/.test(line)&&!/style=\{\{\s*(["']--[\w-]+["']|animationDelay)\s*:/.test(line),
  message:"인라인 style 대신 Tailwind 클래스를 쓰세요. (CSS 변수 전달·animationDelay만 허용)"},
 {id:"native-control",test:(line,file)=>!file.startsWith("components/ui/")&&!file.startsWith(legacyAdmin)&&/<(select|textarea)[\s/>]/.test(line),
  message:"<select>·<textarea> 대신 components/ui의 NativeSelect·Textarea를 쓰세요."},
 {id:"ui-library",test:line=>bannedPackages.test(line),
  message:"다른 UI·CSS 라이브러리 대신 shadcn/ui(components/ui)와 Tailwind를 쓰세요."},
];

async function* walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const path=join(dir,entry.name);
  if(entry.isDirectory())yield* walk(path);
  else if(/\.(tsx?|css)$/.test(entry.name))yield path;
 }
}

const problems=[];
let arbitraryColors=0;
for(const root of roots){
 for await(const path of walk(root)){
  const file=relative(".",path).split(sep).join("/");
  if(file.endsWith(".css")&&!allowedCss.has(file)){
   problems.push(`${file}: 새 CSS 파일 대신 Tailwind 유틸리티와 app/globals.css의 토큰을 쓰세요.`);
   continue;
  }
  const lines=(await readFile(path,"utf8")).split("\n");
  lines.forEach((line,index)=>{
   if(line.includes("design-exception:"))return;
   for(const rule of rules)if(rule.test(line,file))problems.push(`${file}:${index+1} [${rule.id}] ${rule.message}`);
   arbitraryColors+=(line.match(/-\[#[0-9a-fA-F]{3,8}\]/g)||[]).length;
  });
 }
}

if(arbitraryColors)console.warn(`참고: 임의 색상값([#…]) ${arbitraryColors}곳. 반복되는 색은 app/globals.css 토큰으로 옮기세요.`);
if(problems.length){
 console.error(`디자인 규칙 위반 ${problems.length}건 (DESIGN.md):\n${problems.map(p=>`  - ${p}`).join("\n")}`);
 process.exit(1);
}
console.log("디자인 규칙 검사 통과 (DESIGN.md)");
