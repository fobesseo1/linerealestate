# 선부동산 AWS 이전 + 검색 등록 계획 (2026-11-22, 코드·DB·공개 사이트 확인 후 다시 씀)

## 1. 지금 상태 (확인한 사실)

### 사이트
- Next.js 16 + React 19 + TypeScript, Vercel 배포 `https://linerealestate.vercel.app` (정상 동작, 홈 약 1.1초·HTML 약 490KB).
- 공개 페이지: 홈, `/listings`, `/property/[번호]`, `/works`, `/works/[번호]`, `/compare`, `/process`, `/lab/*`(시험 페이지 9개), `/admin`.
- 서버 API 11개: 문의 접수·알림(`/api/inquiries/*`, 카카오 연결 포함), 공개 자료(`/api/content/publications`), 지도·네이버 링크(`/api/content/map`, `naver-link`).
- 이미 있는 검색 준비: `app/sitemap.ts`(64개 주소), `app/robots.ts`(/admin·/api 막음), 제목·설명 메타, JSON-LD `RealEstateAgent`(`lib/site.ts`). **없는 것: 구글·네이버 등 소유확인 태그.**
- GitHub Actions `pages.yml`: 예전 GitHub Pages 주소 → Vercel 이동 페이지만 만듦.

### 데이터 — 이미 Supabase에 있음
선부동산은 **이미 Supabase를 쓰고 있다.** 프로젝트 `ravnmmskkcoojkdipizz` 하나를 경매(auction-deal-finder)·lineestate(선아파트)·선부동산이 **같이 쓰고**, 선부동산 것은 표 이름으로 구분된다. 로그인(Auth) 계정도 공유.

| 표/저장소 | 용도 | 건수(11-22) |
| --- | --- | --- |
| `lineestate_admins` | 관리자 이메일 2개 | 2 |
| `lineestate_drafts` | 매물·사례 초안 | 71 |
| `lineestate_revisions` | 수정안·승인 이력 | 158 |
| `lineestate_published` | 공개 중인 매물·사례 | 71 |
| `lineestate_deal_records` | 입점 기록 | 39 |
| `linerealestate_inquiries` | 상담 문의 | 1 |
| `linerealestate_inquiry_admins` | 문의 관리자 | 2 |
| `linerealestate_notification_settings` | 메일·카카오 알림 설정(암호화) | 1 |
| 저장소 `lineestate-originals` | 초안 사진 | 1,434개 |
| 저장소 `lineestate-public` | 공개 사진 | 2,200개 |

- 이름이 `lineestate_`로 시작하지만 **선부동산 전용**이다. lineestate(선아파트) 코드는 이 표들을 전혀 쓰지 않는다(확인함).
- lineestate도 AWS로 옮길 때 **DB는 Supabase에 그대로 두고 웹서버만 옮겼다**(`lineestate/docs/server-move-weekend.md`).

### 결론
**DB·사진은 옮길 필요가 없다.** 새 표를 만들거나 자료를 복사하지 않고, 웹서버만 AWS로 옮겨 같은 Supabase에 연결한다. 자료 이동이 없으니 기존 자료가 지워질 위험도 없다. 옮긴 뒤에도 Vercel과 AWS가 같은 DB를 보므로 되돌리기도 쉽다.

### 옮겨 갈 곳 (확인함)
- `lineestate.co.kr` 네임서버는 Cloudflare, 지금 CloudFront 서울(ICN)로 서비스 중. `sanbon.lineestate.co.kr`은 아직 없음.
- 서버: AWS Lightsail 서울 8GB(월 $44, 2026-11-07 결정), Coolify로 배포 (`lineestate/docs/server-move-weekend.md`).

## 2. 확정된 것
- 새 주소 `sanbon.lineestate.co.kr`. 하위 주소라도 검색 불이익 없음.
- lineestate 서울 서버(AWS Lightsail 8GB, Coolify)에 작은 앱으로 추가, CloudFront 없이 직결. 추가 서버비 없음.
- 상가 사이트(산본중심상가 중심). 검색어·설명은 상가로. 매물 글은 네이버 부동산·블로그 복사 금지.

## 3. 시험과 훅 (2026-11-22 만듦)

| 무엇 | 명령 | 언제 |
| --- | --- | --- |
| 전체(지킴이 + 타입 + 단위 시험) | `npm test` | 푸시 전 자동(`.githooks/pre-push`), 언제든 |
| 1단계 코드 시험 | `npm run test:step1` | 코드 고친 뒤 (인터넷·DB 없음) |
| 1단계 전체(서버 방식 빌드·실행) | `npm run check:standalone` | 1단계 마무리, 서버 올리기 전 (새 주소로 빌드해 로컬 3011에서 2·5단계 시험) |
| 2단계 새 서버 | `npm run check:site -- --base https://sanbon.lineestate.co.kr --stage server` | Coolify 배포 직후 |
| 3단계 외부 서비스 | `npm run check:site -- --base https://sanbon.lineestate.co.kr --stage services` + 손 확인 | 주소 추가 뒤 |
| 4단계 전환 | `npm run check:site -- --base https://sanbon.lineestate.co.kr --stage switch` | Vercel 301 켠 뒤 |
| 5단계 검색 | `npm run check:site -- --base https://sanbon.lineestate.co.kr --stage search --expect google,naver,bing,daum` | 인증 태그 넣은 뒤 |
| 2~5 한꺼번에 | `--stage all` | 전환 뒤 아무 때나 |
| 지킴이 | `npm run test:guard` | 전체 시험에 포함 |

- 지킴이(`scripts/qa/guard-check.mjs`, 시험 `tests/guard.mjs`): 비밀 키가 브라우저로 새는 것, **현재 자료 지우기(.delete·.remove·drop table 등)**, 주소 직접 쓰기, 선부동산 것이 아닌 표·버킷 사용을 막는다.
- 훅: Claude가 일을 끝낼 때(`.claude/settings.json` Stop) 지킴이 → 코드가 바뀌었으면 타입 검사·단위 시험(`scripts/qa/stop-check.mjs`), 실패하면 Claude가 고칠 때까지 못 끝냄. git 푸시 전(`.githooks/pre-push`)에 `npm test`. 새 컴퓨터에서는 `npm run hooks:install` 한 번.
- 실제 사이트 시험은 읽기만 한다. 문의 API는 가짜 칸으로 보내 DB에 닿기 전에 400으로 끝난다.

## 4. 할 일

### 1단계 — 코드 (이 저장소)
- [x] **(필수) 요청 출처 검사**: `lib/inquiries/server.ts:12` `sameOrigin()`이 `https://linerealestate.vercel.app`만 허용한다. 안 고치면 새 주소에서 **문의 접수·관리자 지도 확인·네이버 링크 변환이 모두 403**. 옮기는 동안은 옛 주소와 새 주소 둘 다 허용.
- [x] 주소를 `NEXT_PUBLIC_SITE_URL` 하나로: `lib/site.ts:9`(sitemap·robots·메타·JSON-LD가 여기서 나옴), `lib/inquiries/server.ts:6`(카카오 복귀·알림 링크), `lib/inquiries/notifications.ts:23`(메일 ID), `components/admin/inquiry-inbox.tsx`(카카오 안내 문구), `scripts/build-pages.mjs`(GitHub Pages 이동 페이지), `scripts/inquiry-sheets.gs`, README·docs.
- [x] `next.config.ts`에 `output: "standalone"` (Vercel은 이 설정을 무시하고 그대로 배포됨 — lineestate에서 확인된 사항).
- [x] `app/robots.ts` → `app/robots.txt/route.ts`(다음 인증 주석 줄용).
- [x] `app/layout.tsx` `metadata.verification`에 네이버·빙 태그 자리.
  - 인증 값은 환경변수로: `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`(빌드 때 읽음), 다음은 `DAUM_WEBMASTER_TOKEN`(robots.txt 첫 줄). 비어 있으면 태그를 찍지 않음.
  - GitHub Pages 이동 페이지는 저장소 변수 `NEXT_PUBLIC_SITE_URL`을 따라감(전환 때 GitHub 저장소 Variables에 새 주소 넣기). `scripts/inquiry-sheets.gs`는 구글 시트에 붙여 넣는 코드라 3단계에서 손으로 주소 변경.
- [ ] 방문자 IP(`app/api/inquiries/route.ts:11`): 이미 `x-forwarded-for`를 두 번째로 읽어서 새 서버에서도 동작한다. Traefik 뒤에서 값이 맞는지만 시험 때 확인.
- [ ] 공개 자료 캐시: `/api/content/publications`는 열린 화면이 10초마다 부르고, Vercel에선 CDN이 받아 줬다. 새 서버에선 서버 안 30초 캐시(`lib/content/public.ts`)가 DB 호출을 막는다 → DB 부담은 같고 서버 요청만 늘어남(작은 사이트라 문제 없을 것, 시험 때 확인).
- [x] 로컬 standalone 확인(`npm run check:standalone`, 포트 3011): 새 주소로 빌드·실행해 2단계 12/12, 5단계 3/3 통과(11-22, 매물 71건·사이트맵 76개).
  - DB 문 암호 `SUPABASE_GATE_TOKEN`은 Vercel에서 값을 볼 수 없다(Sensitive). 원본은 `lineestate-private/server/gate-tokens.env`의 **office** 값. `.env.local`은 11-22 사용자가 이 값으로 바꿈. AWS 서버에도 이 값을 넣는다.
- [ ] 푸시 뒤 Vercel 배포가 계속 정상인지 `npm run check:site -- --stage all`.

### 2단계 — 서버·도메인 (사용자와 함께)
- [x] Coolify 새 앱 `sanbon`(GitHub `fobesseo1/linerealestate` main). 빌드: `npm ci && npx next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/`, 실행: `node .next/standalone/server.js`(`PORT`, `HOSTNAME=0.0.0.0`).
- [x] 환경변수(코드에서 실제로 읽는 것 전부, 확인함) — sanbon 앱 칸에만, 값은 사용자가 Vercel에서 직접 복사:
  - `SUPABASE_SECRET_KEY` — 문의 저장·관리자 확인. **알림 설정(지메일 앱 비밀번호·카카오 키·네이버 지도 비밀키)이 이 값으로 암호화돼 DB에 있으므로 반드시 Vercel과 같은 값.**
  - `SUPABASE_GATE_TOKEN` — 공개 키로 DB 읽을 때 붙이는 문 암호(DB 쪽 검사는 lineestate 마이그레이션 `ls_gate`).
  - `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, `SBIZ365_SIMPLE_KEY`, 새로 `NEXT_PUBLIC_SITE_URL`. `NEXT_PUBLIC_*`는 "빌드 때도 쓰기" 체크.
  - Supabase 주소·공개 키는 환경변수가 아니라 코드 안 `lib/content/public-config.json`에 있어 따로 넣을 것 없음.
  - `.env.local`의 경매용 키(ONBID·MOLIT·텔레그램·CRON 등)는 선부동산 코드가 안 쓰므로 넣지 않음.
- [x] 첫 빌드는 lineestate 빌드와 겹치지 않게.
- [x] Cloudflare DNS `sanbon` A → 서버 IP(회색). 인증서는 Coolify 자동.
- **2단계 완료 (2026-11-22)**: Coolify 프로젝트 `sanbon` / 앱 `linerealestate:main-c0g3x9oqfblryyyyasodw1li`(Railpack, `npm ci`, standalone 빌드, 포트 3000). GitHub 앱 `lineestate-coolify-seoul`에 저장소 추가 → main 푸시 자동 배포. 환경변수 5개(공개 2 + 비밀 3, 비밀은 사용자가 `.env.local` 값으로 입력). Cloudflare `sanbon` A 43.202.20.134 DNS only. Let's Encrypt 인증서(~2027-02-20), http→https. 첫 빌드 약 18분.
  - 시험: `check:site --base https://sanbon.lineestate.co.kr` server 12/12, services 2/2, search 3/3. lineestate.co.kr 영향 없음(200).
  - 속도(중간값, 한국 PC): 매물 목록 0.98초(Vercel 워싱턴) → 0.21초, 공개 매물 API 0.19 → 0.17초, 홈 0.33 → 0.31초.
  - 남은 정리: Coolify가 자동으로 붙인 `www.sanbon.lineestate.co.kr`(DNS 없음, 화면에서 삭제 안 됨)와 임시 `…sslip.io` 주소는 전환 뒤 지우기.

### 3단계 — 외부 서비스에 새 주소 **추가** (지우지 않음)
- [x] Supabase Redirect URLs에 `https://sanbon.lineestate.co.kr/admin/**` 추가. **Site URL은 경매 것이라 바꾸지 않음.** (관리자 설정 메일은 접속한 주소로 돌아오게 돼 있어 코드 수정은 필요 없음)
- [x] 카카오 개발자: 사이트 도메인에 새 주소, Redirect URI `https://sanbon.lineestate.co.kr/api/inquiries/kakao/callback` 추가. 옛 주소는 남겨 둠.
- [x] 네이버 지도 Web 서비스 URL에 새 주소 추가.
- **3단계 (2026-11-22)**: Supabase Redirect URLs 7개(새 `https://sanbon.lineestate.co.kr/admin/**` 추가, Site URL·기존 6개 그대로) / 카카오 앱 `선아파트`(ID 1604069) REST 키 로그인 리다이렉트 URI에 새 콜백 추가(3개), 제품 링크 관리 웹 도메인에 새 주소 추가(기본은 옛 주소 그대로) / 네이버 지도 앱 `lineauction`(Client ID eba3h7218n) Web 서비스 URL에 새 주소 추가(8/10). 새 주소 매물 상세 지도·핀 표시 확인, 콘솔 오류 없음.
  - `scripts/inquiry-sheets.gs` 주소를 새 주소로 바꿈. **사용자 Apps Script(`linerealestate 문의 자동 기록`)의 같은 줄도 4단계(301) 전에 바꿔야 함.** 새 주소 `/api/inquiries/sheets` 토큰 없이 401 확인.
  - 손 확인 완료(11-22): 새 주소 관리자 로그인, 알림 테스트 → 카카오·메일 수신, 카카오 링크 새 주소로 열림(사용자). Apps Script 주소 변경 후 매분 실행 '완료됨'.

### 4단계 — 시험 → 전환
- [ ] 새 주소에서: 홈·매물·사례·지도·문의 접수·메일/카카오 알림·관리자 로그인·사진 등록·sitemap/robots·카톡 미리보기.
- [ ] Vercel Routes로 옛 주소 → 새 주소 301(경로·쿼리 유지). Vercel 프로젝트 2주 보존.
- 되돌리기: Vercel 넘기기 끄기 (DB가 같아서 자료 손실 없음).

### 5단계 — 검색 등록
1. 구글: lineestate.co.kr 도메인 속성에 자동 포함 → sitemap 제출, 색인 요청.
2. 빙: 사이트 추가, 사이트맵 직접 제출.
3. 네이버 서치어드바이저: 별도 등록, 메타 태그, 사이트맵 전체 주소.
4. 다음: robots.txt 인증 줄 + PIN.
5. IndexNow: sanbon 전용 키.
6. 1주·4주 뒤 색인 확인.

## 5. 지키는 것
- 기존 표·사진·Auth 설정 삭제·변경 금지. 새 주소는 **추가만**.
- 경매·lineestate 표와 설정은 건드리지 않음.
- 비밀값은 채팅·git에 쓰지 않음.
