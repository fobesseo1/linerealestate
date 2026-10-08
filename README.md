# 선부동산 · 산본 상가 홈페이지 시안

TypeScript · Next.js · Tailwind CSS · shadcn/ui 패턴의 Button/Dialog(Radix 기반).

## 실행

```sh
npm install
npm run dev
```

시안: http://localhost:3010 (다른 프로젝트와 충돌하지 않도록 기본 포트를 3010으로 지정했습니다.)

공개 사이트: https://fobesseo1.github.io/linerealestate/
저장소: https://github.com/fobesseo1/linerealestate

`main` 브랜치에 push하면 GitHub Actions가 정적 사이트를 빌드해 GitHub Pages에 자동 배포합니다.
`npm run build:pages`로 같은 정적 배포 파일을 `out` 폴더에 만들 수 있습니다.
GitHub Pages에서는 `/linerealestate` 경로를 적용하고, 로컬 실행은 기존 3010번 주소를 유지합니다.
실제 상담 접수 서버는 연결하지 않았으며 공개 사이트에서도 문의 내용 미리보기만 제공합니다.

- 메인: `/#home`
- 매물 목록: `/#listings`
- 매물 상세: `/#case/cafe`, `/#case/beauty`, `/#case/landlord`, `/#case/sale`
- 실제 중개 사례: `/#works`, `/#work/pyeonbaek`, `/#work/salon`, `/#work/comma`, `/#work/clinic`
- 점포 비용 비교: `/#compare`
- 상담 과정: `/#process`

## 내용과 이미지

- 이전 시안의 가상 시나리오 4건과 실제 중개 완료 사례 4건을 보존했습니다.
- 가상 매물에는 AI 이미지·가정 조건임을 표시합니다. 실제 사례 사진은 준비 중입니다.
- 명함의 김영선 공인중개사 연락처와 첨부 SVG 로고를 사용합니다.
- Pretendard Variable을 프로젝트에 저장해 사용합니다.
- 검색·업종 필터·월세 필터·찜·비용 계산·상담 내용 정리를 체험할 수 있습니다.
- 찜 정보만 현재 브라우저에 저장합니다. 상담 내용은 서버로 접수되지 않습니다.
- 메인과 매물 상세에 전화번호·요구 사항 입력창을 제공합니다. 전화번호와 정보 제공 동의는 필수이며 요구 사항·업종·연락 시간은 선택입니다.
- 매물 문의에는 제목과 번호를 자동으로 포함하고, 중개 사례 문의와 임대 의뢰도 같은 입력창으로 연결합니다.
- 모바일 하단에 전화·문의 버튼을 고정합니다. 요청 버튼은 현재 미리보기로 연결되며 실제 접수 성공을 표시하지 않습니다.
- GitHub Pages로 공개하며 Vercel·Supabase는 아직 연결하지 않았습니다.
- 이전 사이트는 `sun-demo` 폴더에 보존되어 있습니다.

디자인 기준: `docs/design/DESIGNstyle-lineestate.md`.
