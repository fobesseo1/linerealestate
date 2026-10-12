# 선부동산 상담 문의 저장소

사이트: https://linerealestate.vercel.app

Supabase 프로젝트: ravnmmskkcoojkdipizz

문의 테이블: public.linerealestate_inquiries

문의 관리자: public.linerealestate_inquiry_admins

site_id는 linerealestate로 고정한다. 별도의 lineestate 또는 자매 사이트 문의를 이 테이블에 넣지 않는다. 기존 매물·사례 테이블 이름은 이번 작업에서 변경하지 않는다.

전화번호, 문의 내용, 상담 분야, 관련 매물번호·제목, 희망 업종, 연락 가능한 시간, 개인정보 제공 동의 시각·버전, 접수 시각, 처리 상태를 저장한다. 이메일·카카오 알림의 발송 상태는 별도 열로 기록한다. 토큰·시크릿은 문의 테이블에 저장하지 않는다.

일반 방문자는 읽기·쓰기를 할 수 없다. 서버에서 검증 후 접수하며, 허용된 관리자만 조회하고 처리 상태를 변경한다. 관리자 허용 목록은 ysyh1730@naver.com과 hjdh59@gmail.com이다. 일반 로그인 계정에는 문의가 보이지 않는다.

웹 접수는 /api/inquiries에서 입력·동의·요청 출처를 검사하고 linerealestate_accept_inquiry를 통해 저장한다. 요청 UUID로 중복 제출을 막고 전화번호별 10분 3건, 해시 처리한 접속 주소별 10분 10건으로 제한한다. 원래 접속 IP는 저장하지 않는다. 저장 후 알림을 시도하므로 알림 실패가 접수 기록을 없애지 않는다.

관리자 화면의 ‘상담 문의함 · 알림 연결’에서 최신 200건을 조회하고 새 문의·연락 완료·상담 종료로 처리 상태를 변경한다. 이메일·카카오 발송 결과를 표시하고 미발송 알림을 다시 보낼 수 있다.

이메일은 사용자의 2026-10-12 지시에 따라 ysyh17301730@gmail.com 한 곳으로만 발송한다. 같은 Gmail 계정의 SMTP를 사용하며 Google 앱 비밀번호를 관리자가 직접 입력한다. 일반 Google 로그인 비밀번호는 사용하지 않는다. 기존 Naver 수신 주소나 다른 발송 서비스로 보내지 않는다.

카카오 연결은 관리자가 REST API 키·카카오 로그인 시크릿을 저장한 후 본인 카카오로 로그인하고 talk_message 권한을 동의한다. 기존 Supabase 복귀 주소를 삭제하지 않고 https://linerealestate.vercel.app/api/inquiries/kakao/callback 을 추가한다. 토큰은 서버에서 교환·갱신한다. 현재 연결한 카카오 계정 하나의 ‘나와의 채팅’으로 발송한다.

설정은 linerealestate_notification_settings에 AES-256-GCM으로 암호화해 저장한다. 암호화 키는 서버의 SUPABASE_SECRET_KEY에서 사이트 전용 값으로 파생한다. 이 키를 교체할 때는 기존 설정을 이전하거나 다시 연결해야 한다. 브라우저 직접 접근을 금지하고 설정 API에서는 연결 여부만 반환한다. 서버 키는 Vercel Production의 Secret 환경 변수로만 등록한다.

관리자 설정 저장은 발송 완료를 의미하지 않는다. ‘알림 테스트 보내기’ 결과와 실제 수신을 확인해야 한다. 키·앱 비밀번호·카카오 본인 로그인이 완료되기 전에는 문의는 저장되지만 알림 상태가 ‘연결 필요’로 표시된다.

GitHub Pages는 서버 기능을 실행할 수 없으므로 예전 주소는 Vercel 공개 사이트로 이동시킨다. 기존 상세 링크의 해시와 관리자 경로를 유지한다.
