# CRATEDIGGERS 작업 인계

## 다른 컴퓨터에서 이어가기

1. `https://github.com/hjw0602-cloud/CrateClub.git`을 clone한다.
2. Codex에서 clone한 폴더를 연다.
3. 새 작업에서 `AGENTS.md와 HANDOFF.md를 읽고 이전 작업을 이어가자`라고 요청한다.
4. Git에 포함되지 않는 `.env`는 기존 컴퓨터에서 별도로 안전하게 옮긴다.

## 현재 제품 방향

- 힙합과 R&B 리스너가 음악 취향을 기록하고 공유하는 소셜 플랫폼이다.
- 게시판보다 앨범 평가, 개인 취향 프로필, 기간별 음악 결산을 중심에 둔다.
- 장기간 사용할수록 사용자의 음악 취향 연대기가 쌓이는 제품을 지향한다.
- 자세한 확정 사항과 레퍼런스는 `AGENTS.md`를 기준으로 한다.

## 구현 상태

- React, TypeScript, Vite 기반 반응형 웹사이트
- Cloudflare Pages 및 Pages Functions 배포 구조
- Supabase 이메일 및 카카오 인증 연결 코드
- 리뷰, 답글, 좋아요, 팔로우, 커뮤니티 게시글 Supabase 저장 구조
- 신보, 앨범 상세, 매거진, 커뮤니티, 검색, 알림, 프로필, 관리자 화면
- 라이트 및 다크 모드
- 상단 `공연` 탭과 기본 공연 일정 페이지
- Supabase 스키마, 기존 DB용 마이그레이션, 초기 작품 시드

## Supabase 적용 순서

기존 `schema.sql`을 이미 실행한 프로젝트:

1. `supabase/migration_localstorage_to_supabase.sql`
2. `supabase/seed.sql`

새 Supabase 프로젝트:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

Cloudflare 환경 변수:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `MUSICBRAINZ_CONTACT`

## 진행 중인 기획

- 사이트를 음악 리뷰 SNS 방향으로 더 발전시키는 인터뷰를 시작했다.
- 아직 피드 우선순위, 사용자가 올릴 수 있는 게시물 범위, 사용자·아티스트·앨범 팔로우 구조는 확정되지 않았다.
- 다음 작업에서는 이 세 질문부터 다시 이어간다.

## 검증

- 최근 TypeScript 검사 및 프로덕션 빌드가 통과했다.
- 로컬 실행은 `pnpm install`, `pnpm dev`를 사용한다.
- 현재 로컬 미리보기 기본 주소는 `http://127.0.0.1:4173`이다.
