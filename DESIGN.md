# 선부동산 디자인 가이드 (A-1)

공개 사이트 디자인의 **유일한 기준 문서**다. 화면·컴포넌트·스타일을 만들거나 고치기 전에 반드시 읽는다.
기준 화면은 현재 공개 사이트 https://linerealestate.vercel.app/ 이다.

---

## 0. 필수 규칙 (반강제)

아래 규칙은 특별한 사유가 없는 한 예외 없이 지킨다. `npm run build`(Vercel 배포 포함)는 먼저 `scripts/check-design.mjs`를 실행하며, 위반이 있으면 **빌드가 실패**한다. 직접 확인할 때는 `npm run check:design`.

| # | 규칙 | 자동 검사 |
| --- | --- | --- |
| 1 | **글꼴은 Pretendard 하나.** 다른 글꼴·`font-family`·`font-[…]`를 지정하지 않는다. | ✅ font |
| 2 | **자간은 모든 글자 -2% (`-0.02em`).** body에 한 번 정의되어 상속된다. 제목마다 자간을 따로 주지 않는다. 유일한 예외는 영문 대문자 머리표의 `tracking-eyebrow`. | ✅ tracking |
| 3 | **스타일은 Tailwind 유틸리티로 작성한다.** 새 CSS 파일을 만들지 않는다. (`app/globals.css` 토큰 파일과 관리자 전용 `components/admin/admin.css`만 허용) | ✅ CSS 파일 |
| 4 | **UI 부품은 shadcn/ui(`components/ui`)를 먼저 쓴다.** 버튼·대화상자·입력·선택·배지·카드를 새로 만들지 말고, 없는 부품은 shadcn으로 추가한다. 다른 UI·CSS 라이브러리(MUI, antd, Chakra, styled-components, emotion, Bootstrap, Mantine)는 쓰지 않는다. | ✅ select·textarea, 라이브러리 |
| 5 | **인라인 `style`을 쓰지 않는다.** CSS 변수 전달(`{"--shift": …}`)과 `animationDelay`만 허용. | ✅ inline-style |
| 6 | **색·글자 크기·굵기는 토큰을 쓴다.** 같은 임의값(`text-[#…]`, `text-[19px]`)이 두 번 이상 필요하면 `app/globals.css`에 토큰을 추가한다. | ⚠️ 임의 색상 개수 경고 |
| 7 | **여백·간격·크기는 4px 배수**(Tailwind 기본 간격: `p-1`=4px, `gap-3`=12px …)를 쓴다. 글자 크기는 아래 단계를 따른다. | 검토 시 확인 |

**예외 처리:** 꼭 필요한 경우 해당 줄에 사유를 남긴다. 검사는 그 줄을 건너뛴다.

```tsx
<video className="…" style={{aspectRatio:ratio}}/> {/* design-exception: 영상마다 비율이 달라 런타임 값 필요 */}
```

예외는 최소로 쓰고, 같은 예외가 반복되면 토큰이나 컴포넌트로 만든다.

---

## 1. 브랜드

- 상호: 선부동산 / LINE REAL ESTATE. 담당 공인중개사 김영선.
- 주색은 `#E00B41`(brand). 황금색·황토색·어두운 갈색으로 대체하지 않는다.
- 짙은 헤더·푸터·히어로에는 `/logo-white.svg`, 밝은 배경에는 `/logo.svg`. 원본 경로를 유지한다.
- 분위기: 짙은 배경(ink) + 붉은 강조선 + 직선 카드 + 굵은 제목. 카드·사진·지도는 기울이지 않는다.

## 2. 글꼴과 자간

- **Pretendard Variable**(100–900), `app/fonts/PretendardVariable.woff2`. 라이선스 `app/fonts/LICENSE.txt`. `--font-sans`로 지정되어 모든 요소(입력창·버튼 포함)가 상속한다.
- **자간 -2%**: `--tracking-normal: -0.02em`. Tailwind의 기본 tracking 단계(`tracking-tight` 등)는 제거되어 있다.
- `tracking-eyebrow`(0.2em): `SANBON, YOUR NEXT PLACE` 같은 영문 대문자 머리표에만 쓴다.

### 글자 크기 단계

| 토큰 | 크기 | 주 용도 |
| --- | --- | --- |
| `text-micro` | 9px | 사진 위 라벨, 보조 안내 |
| `text-tiny` | 10px | 머리표, 메타 정보, 작은 배지 |
| `text-caption` | 11px | 캡션, 안내문, 상단 띠 |
| `text-xs` | 12px | 보조 본문, 링크, 표 머리 |
| `text-body` | 13px | 입력창, 카드 설명 |
| `text-sm` | 14px | 기본 본문(body), 메뉴 |
| `text-md` | 15px | 상세 본문, 사실 표 값 |
| `text-base` | 16px | 모바일 입력창(확대 방지) |
| `text-lead` | 17px | 소제목 |
| `text-lg` | 18px | 카드 제목 |
| `text-xl` | 20px | 목록 카드 제목 |
| `text-2xl` | 24px | 대화상자 제목, 숫자 강조 |

화면 큰 제목은 `text-[clamp(…)]`로 반응형 크기를 쓴다(예: 상세 제목 `clamp(28px,3.1vw,44px)`).
줄 간격은 크기 토큰에 포함되지 않으므로 필요할 때 `leading-*`를 함께 쓴다.

### 굵기

`font-normal`(400) 본문 · `font-medium`(500) · `font-semibold`(600) 메뉴 · `font-demibold`(650) 강조 · `font-bold`(700) · `font-extrabold`(800) 카드 제목 · `font-strong`(750) 가격 · `font-heavy`(850) 화면 제목.

## 3. 색

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `brand` | #E00B41 | 주 행동 버튼, 가격, 강조선, 라벨 |
| `brand-hover` | #BE0735 | brand 버튼 hover |
| `brand-soft` | #FF6E95 | 짙은 배경 위 활성 메뉴·강조 글자 |
| `brand-pale` | #FF8EAE | 짙은 배경 위 보조 링크(광고 영상) |
| `brand-tint` | #FFF0F4 | 연한 붉은 배경(상담 아바타) |
| `ink` | #19191F | 헤더·푸터·히어로·상담 카드 배경, 본문 글자 |
| `ink-raised` | #24242C | 짙은 배경 위 카드·검색창 |
| `ink-line` | #393940 | 짙은 배경 위 테두리 |
| `background` | #F5F5F6 | 페이지 바탕 |
| `card` / `white` | #FFFFFF | 카드·표·입력창 |
| `gray-50` | #F7F7F7 | 연한 면 |
| `gray-100` | #EEEEEF | 얇은 구분선 |
| `gray-200` | #DEDEE4 | 기본 테두리(`border`) |
| `gray-300` | #C9C9D0 | 입력 테두리(`input`) |
| `gray-400` | #B7B7C0 | 짙은 배경 위 보조 글자 |
| `gray-500`~`800` | #999 → #666 | 밝은 배경 위 보조 글자 (숫자가 클수록 진함) |
| `gray-900` | #34343D | 진한 보조 글자 |

shadcn 의미 토큰(`primary`, `muted`, `border`, `input`, `ring` …)은 `:root`에서 위 값을 가리킨다. Tailwind 기본 회색 팔레트는 이 사이트 값으로 교체되어 있다.

## 4. 레이아웃과 간격

- **본문 폭:** 최대 1440px, 좌우 5% → `page` 유틸리티. 섹션 배경은 화면 끝까지 이어지고, 그 안 내용은 `px-gutter`(또는 `mx-gutter`)로 `page`와 같은 선에 맞춘다.
- **화면 구간:** 모바일 `max-md:`(≤760px) · 태블릿 `max-lg:`(≤1100px) · 고정 도구 `2xl:`(≥1661px).
- **열:** PC 매물 카드 3열, 상세는 본문 + 상담 사이드바(320px, 태블릿 280px) 2열. 모바일은 1열.
- **간격:** 4px 배수. 자주 쓰는 값: 카드 안쪽 24px(`p-6`), 카드 사이 24px(`gap-6`), 섹션 위아래 56–64px(`pt-14 pb-16`).
- 모바일 하단 고정 문의 바(68px)와 캐릭터·내용이 겹치지 않게 한다.

## 5. 모양

| 대상 | 규칙 |
| --- | --- |
| 매물·사례 카드 | 모서리 0, `border-2 border-ink`, hover 시 위로 8px + `shadow-[8px_8px_0_var(--color-brand)]` |
| 정보 카드(`Card`) | 모서리 0, `border border-border`, 흰 바탕 |
| 강조선 | 제목 아래 `border-b-4 border-brand`, 상담 카드·대화상자 위 `border-t-4 border-brand` |
| 버튼 | `rounded-lg`(8px). 짙은 면 위 사각 버튼은 `variant="brand"`(`rounded-sm`) |
| 배지·라벨 | `rounded-sm`, brand 바탕 흰 글자 |
| 대화상자 | `rounded-lg`, 위 4px brand 선 |
| 그림자 | 직선 오프셋 그림자(카드 hover, 대표 매물)만. 흐린 큰 그림자는 떠 있는 요소(캐릭터 말풍선, 고정 도구)에만 |

## 6. 컴포넌트 (shadcn/ui)

`components/ui`에 있는 것을 먼저 쓴다. 새 부품은 `npx shadcn@latest add <이름>`으로 추가한 뒤 이 문서의 토큰에 맞게 다듬는다(`components.json` 설정 사용).

| 부품 | 쓰임 |
| --- | --- |
| `Button` | `default`(brand 빨강) · `outline` · `ghost` · `brand`(짙은 면 위 사각 버튼). 크기 `sm` `default` `lg` `icon`. 링크는 `asChild`로 `<Link>`를 감싼다. |
| `Dialog` (`DialogContent`·`DialogTitle`·`DialogDescription`) | 상담창, 광고 팝업 |
| `Input`, `Textarea` | 모든 입력. 모바일에서 16px로 커져 확대를 막는다. |
| `NativeSelect` | 모든 선택 상자(휴대폰 기본 선택기 유지) |
| `Badge` | `brand` · `light` · `tag` |
| `Card`, `CardTitle` | 상세 정보 블록, 안내 상자 |

- 클래스 결합은 반드시 `cn()`(`lib/utils.ts`)을 쓴다. 새 글자 크기·굵기·자간 토큰을 추가하면 `cn`의 tailwind-merge 설정에도 등록한다. 등록하지 않으면 `text-tiny`가 색상 클래스와 충돌해 사라진다.
- 아이콘은 `lucide-react`.

## 7. 화면 구성

- **공통 틀** `components/site/site-shell.tsx`: 붉은 상단 띠 → 짙은 헤더(로고·검색·찜·상담 요청) → 메뉴(홈·상가 임대차·상가 매매·중개 완료 사례·점포 비용 비교·상담·계약 과정·광고 영상·찜한 매물·내 점포 내놓기) → 본문 → 짙은 푸터. 모바일 하단 전화·문의 바, 넓은 화면 오른쪽 고정 도구.
- **홈** `components/home`: 붉은 안내 띠 → 짙은 히어로(큰 제목, 대표 매물 1.8초 전환, 매물 띠) → 흐르는 매물 띠 → 매물 검색·카드 → 붉은 상담 안내 → 중개 사례.
- **매물·사례** `components/listings`: 목록(필터는 주소 `?type=lease|sale&industry=&rent=&q=&saved=1`에 저장), 상세(제목·상태·사진·거래 정보·소개·지도 + 상담 사이드바).
- **정보 페이지** `/compare`, `/process`: 짙은 제목 띠(`EditorialHeading`) + 붉은 강조선 + 흰 카드.

## 8. 움직임과 캐릭터

- 모든 움직임은 공통 "움직임 끄기/켜기"(`SiteMotionControl`, `useSiteMotion`)와 OS reduced-motion에서 꺼진다. 애니메이션은 `app/globals.css`의 `animate-*` 토큰만 쓴다.
- 홈: 대표 매물 1.8초 전환, 사진 등장, 버튼 빛·밀림, 흐르는 매물 띠, 카드 등장.
- 목록 카드: 짧은 등장, hover 이동·사진 확대. 상세는 자동 교체·강한 반복 움직임 없음.
- 사진 갤러리: 양옆 56px(모바일 44px) 원형 버튼 안 붉은 삼각형, hover 시 붉은 배경. 0.32초 전환, 자동 넘김 없음. 방향키·스와이프·썸네일 자동 스크롤 지원.
- 홈 캐릭터 1개: 스크롤을 따라 움직이고 매물에 포인터·포커스를 주면 제목을 안내. 숨기기 가능.
- 문의 캐릭터: 입력 중 `think`, 접수 완료 `success`, 실패·검증 오류 `fail`. 실패를 완료로 표현하지 않는다. 화면 밖·숨은 탭에서는 멈춘다.

## 9. 내용 표시 규칙

- **금액은 억/만원 하나의 형식**: `price()`(`lib/content/format.ts`)만 쓴다. 10000 → 1억원, 25500 → 2억 5,500만원, 30 → 30만원. 저장값은 만원 단위 숫자.
- 비어 있는 항목은 `미확인`. 거래 사실·사진·원본은 수정하지 않는다.
- 매물·사례는 SUN 번호로 구분하고, 완료 사례는 "현재 모집 아님"을 표시한다.
- 사진 종횡비 유지: 상세 큰 사진 `object-contain`, 목록 썸네일 `object-cover`.
- 비용 비교는 가정 수치임을 계속 표시한다.

## 10. 관리자 화면 예외

`/admin`은 별도 무채색 디자인이다. `components/admin/admin.css`(기존 파일)를 유지하고, `.admin-shell`에서 shadcn 변수(`--primary` 등)를 덮어 공개 사이트의 빨강이 섞이지 않게 한다. 글꼴(Pretendard)·자간(-2%) 규칙은 관리자에도 적용된다. 관리자의 새 화면도 가능하면 Tailwind·shadcn으로 작성한다.

## 11. 결정 기록

- 2026-10-13: A-1 "제일 다이나믹 + 캐릭터"를 공개 사이트 디자인으로 채택. Airbnb 기반 이전 문서 폐기.
- 2026-10-13: 홈 대표 매물 사진 비율 PC 1.9:1, 모바일 1.65:1. 필터 선택 높이 44px. 고정 도구는 1660px 이하에서 숨김. 광고 영상 팝업은 홈 방문 세션당 한 번, 2.2초 후(`public/videos/seon-ad-vertical-v2.mp4`).
- 2026-10-14: 시연용 가상 매물과 시안 비교 페이지 삭제. 실제 주소 체계 전환, Tailwind 토큰·shadcn 통일, 간격 4px 배수.
- 2026-10-14: 금액 표시를 억/만원 형식 하나로 통일.
- 2026-10-21: Pretendard·자간 -2%·Tailwind·shadcn 사용을 필수 규칙으로 지정하고 빌드 검사 추가. 이 문서로 디자인 기준 통합.
