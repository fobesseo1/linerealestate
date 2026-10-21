# 선부동산 · 산본 상가 홈페이지

Next.js(App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase(`lineestate` 테이블·버킷).

- 공개 사이트: https://linerealestate.vercel.app/
- 예전 GitHub Pages 주소(https://fobesseo1.github.io/linerealestate/)는 공개 사이트로 자동 이동합니다(`npm run build:pages`).

## 실행

```sh
npm install
npm run dev
```

로컬 주소: http://localhost:3010 (3000번은 다른 프로젝트용이라 사용하지 않습니다.)

## 주소

| 화면 | 주소 |
| --- | --- |
| 홈 | `/` |
| 매물 목록 | `/listings` · 임대차 `?type=lease` · 매매 `?type=sale` · 찜 `?saved=1` · 검색 `?q=` |
| 매물 상세 | `/property/SUN-1012` |
| 중개 완료 사례 | `/works`, `/works/SUN-1005` |
| 점포 비용 비교 | `/compare` |
| 상담·계약 과정 | `/process` |
| 관리자 | `/admin` |

예전 `#` 주소(`/#listings`, `/#property/SUN-1012`, `/#work/salon` 등)는 새 주소로 자동 연결됩니다.

## 구조

- `app/(site)/` 공개 페이지, `app/admin/` 관리자, `app/api/` 문의·지도 API
- `components/ui/` shadcn/ui 컴포넌트, `components/site/` 공통 헤더·푸터·상담창, `components/home/` A-1 홈, `components/listings/` 매물·사례, `components/inquiry/` 문의 양식
- `lib/content/` 공개 자료 읽기·형식, `lib/inquiries/` 문의 저장·알림

디자인 기준은 [docs/design-system.md](docs/design-system.md), 매물 등록·수정 절차는 [docs/admin-workflow.md](docs/admin-workflow.md)를 따릅니다.

## 네이버 지도

실제 사례 주소는 원문을 보존하고, `npm run maps:prepare`로 건물 번지까지만 Geocoding 조회합니다. 반환 주소가 일치한 좌표만 `lib/maps/public-config.json`에 저장됩니다. 이 파일에는 공개용 Client ID와 좌표만 들어 있고, Client Secret은 `.env.local`에서 로컬 준비 스크립트만 읽습니다.

네이버 Maps 콘솔의 Web 서비스 URL에 `http://localhost:3010`과 공개 사이트 주소를 등록하세요. 조회 실패나 지도 인증 실패 시에는 네이버 지도 검색 링크로 안내합니다.
