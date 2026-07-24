# CRATEDIGGERS 작업 인계

## 2026-07-23 확정 방향 및 1단계 구조 개편

- 핵심 제품은 `오늘 발매 앨범의 실시간 라운지`와 `평가·CRATEPRINT 중심 개인 아카이브`다.
- 메인 내비게이션을 `TODAY / DISCOVER / MY CRATE / COMMUNITY`로 변경했다.
- `/`의 FOLLOWING/FOR YOU 소셜 피드를 초기 MVP에서 제외하고 TODAY 화면으로 교체했다.
- TODAY는 활성 라운지, 오늘 발매 앨범, 이번 주 발매 일정과 최근 활발한 대화로 구성된다.
- `/social`과 `/me`는 기존 링크 호환을 위해 공통 MY CRATE 프로필로 유지한다.
- 기존 DISCOVER, COMMUNITY, 앨범 상세, 라운지와 프로필 경로는 삭제하지 않고 새 구조에 연결했다.
- 과거 HOME 중심 Social과 6개 메뉴 방향은 AGENTS.md에서 폐기된 방향으로 분리했다.
- 다음 구현 단계는 TODAY 데이터 구조와 라운지 UI 고도화이며, 그다음 MY CRATE와 CRATEPRINT 생성 흐름을 구현한다.

## 2026-07-23 CRATEPRINT 구현

- MY CRATE의 대표 3×3 탑스터 영역을 CRATEPRINT Studio로 교체했다.
- RANKED POSTER, RECORD SHELF, TASTE MAP 세 템플릿을 실제 전환 가능한 미리보기로 구현했다.
- 제목·한 줄 설명, 앨범 순서 이동·교체, Mono/Night Blue/Acid/Warm Paper/Chrome/R&B Velvet 테마를 편집할 수 있다.
- 결과는 현재 브라우저 로컬 저장소에 저장하며, 추후 Supabase `crateprints`와 `crateprint_items` 테이블로 이전할 수 있는 독립 데이터 구조를 사용한다.

## 2026-07-23 DISPLAY SHELF 대표 기능 구현

- 기존 3개 템플릿 중심 CRATEPRINT Studio를 LP DISPLAY SHELF 중심 구조로 교체했다.
- B안의 컬렉터 에디토리얼 구성을 기준으로 A안의 레코드숍 진열 구조와 C안의 쿨톤 메탈·아크릴 재질을 결합했다.
- HERO RECORD 1장, SUPPORTING RECORDS 8장, 바이닐 노출, CRATE INDEX, 카탈로그 번호와 4:5 CRATEPRINT 미리보기를 구현했다.
- 본인·타인 프로필에서 같은 DISPLAY SHELF를 사용하며 본인에게만 제목, 문장, 모드, 재질, 앨범 순서·교체 편집을 제공한다.
- MY CRATE LIBRARY와 LISTENING LOG 기본 UI를 추가하고 앨범 상세·라운지에 `내 크레이트에 담기 / 평가하기` 동선을 연결했다.
- 현재 진열대 저장은 브라우저 로컬 저장소이며 실제 공유 이미지 다운로드와 Supabase 영구 저장은 다음 단계다.

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

- 음악 리뷰 SNS 방향의 1차 Social 정보 구조를 확정했다.
- 주 메뉴를 `신보 / Social / 커뮤니티 / 매거진 / Hot Clip / 공연`으로 개편했다.
- Social은 `MY PAGE`가 기본이며 3×3 편집형 탑스터, 최근 평점, 반응 가능한 텍스트 리뷰, 취향 근거가 포함된 사용자 추천을 제공한다.
- `FOLLOWING`에서는 팔로우한 사용자의 음악 활동을 피드로 확인한다.
- 실제 계정별 탑스터 영구 저장, 탑스터 변경 활동 생성, 취향 일치율 계산은 Supabase 연결 단계에서 구현해야 한다.

## 검증

- 최근 TypeScript 검사 및 프로덕션 빌드가 통과했다.
- 로컬 실행은 `pnpm install`, `pnpm dev`를 사용한다.
- 현재 로컬 미리보기 기본 주소는 `http://127.0.0.1:4173`이다.
# 2026-07-19 음악 취향 SNS 개편

## 2026-07-20 쿨톤 컬러 개편

- 웜그레이와 오렌지·라임 조합을 쿨그레이, 블루 블랙, 블루 바이올렛, 아이스 시안 조합으로 교체했다.
- 라이트·다크 모드 모두 동일한 차가운 컬러 위계를 사용하고 앨범 커버가 주된 색감을 담당하도록 채도를 제한했다.
- 주요 CTA는 블루 바이올렛, 상태 및 보조 강조는 아이스 시안으로 역할을 분리했다.
- 후속 조정으로 페이지 배경의 푸른 색조와 컬러 그라데이션을 제거하고 중성 회색·차콜 단색으로 변경했다.

## 2026-07-20 앨범 라운지

- `/release/:id/lounge`에 앨범별 상시 채팅방 UI를 추가했다.
- HOME 상단의 LIVE LOUNGES에서 현재 활발한 앨범 채팅방으로 진입할 수 있다.
- 앨범 상세에 `라운지 참여`와 `평가하기`를 분리해 배치하고 최근 참여 인원을 표시한다.
- 현재 채팅은 샘플 데이터와 화면 내 로컬 상태이며, 리뷰 데이터와 분리되어 있다. 다음 단계에서 Supabase Realtime 기반 메시지 저장과 접속자 상태를 연결한다.
- 라운지를 댓글 피드에서 단체 메신저 UI로 재구성했다. 타인 메시지는 왼쪽, 본인 메시지는 오른쪽에 표시하고 연속 메시지, 날짜 안내, 트랙 칩과 읽음 숫자를 지원한다.
- 전역 디자인은 테두리·그림자·대형 영문 제목을 줄이고, 기능별 각기 다른 중간 수준의 모서리 반경과 여백 중심 위계로 다듬었다.

- 메인 메뉴를 `HOME / DISCOVER / COMMUNITY / MY CRATE`로 변경했다.
- HOME은 `FOLLOWING / FOR YOU` 피드이며 리뷰, 탑스터, 앨범 리스트 등 음악 객체에 연결된 샘플 활동을 표시한다.
- DISCOVER는 추천, 신보, 매거진, Hot Clip, 공연 카테고리를 한 화면에 통합했다. 기존 개별 URL은 호환을 위해 유지한다.
- `/my-crate`, `/social`, `/me`, `/user/:id`는 모두 `CrateProfileRoute`와 공통 프로필 레이아웃을 사용한다.
- 본인 프로필에만 프로필·대표 탑스터 편집 UI가 보이고, 타인 프로필에는 취향 일치 정보와 팔로우 기능이 보인다.
- 새 SNS 화면은 `src/sns-pages.tsx`, 전용 반응형 스타일은 `src/sns.css`에 있다.
- 현재 추천과 피드 활동은 기존 샘플 데이터 기반 시각화다. 다음 단계에서 활동 이벤트 모델, 추천 알고리즘, 탑스터 반응과 자동 결산을 서버 데이터에 연결한다.
