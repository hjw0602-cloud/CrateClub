# CRATEDIGGERS 작업 인계

## 현재 제품 방향 — 2026-07-25

CRATEDIGGERS는 앨범으로 자신만의 음악 취향 보드인 CRATEPRINT를 만들고, 평가와 감상 기록을 장기간 축적하며, 완성된 결과물을 공유하는 개인 음악 아카이브 도구다.

핵심 흐름은 `앨범 찾기 → CRATEPRINT 만들기 → 이미지·링크 공유 → MY CRATE 저장 → 취향 기록 누적 → 선택적으로 EXPLORE 공개 → 같은 템플릿으로 다시 만들기`다.

초기 공개 내비게이션은 다음 세 개만 사용한다.

- CREATE
- MY CRATE
- EXPLORE

TODAY, 라이브 라운지, 실시간 채팅, COMMUNITY, FOLLOWING/FOR YOU와 사용자 추천은 초기 MVP에서 제외했다. 기존 구현은 삭제하지 않고 `src/sns-pages.tsx`, 기존 App 내부 페이지 컴포넌트와 관련 스타일에 후속 기능으로 남아 있지만, 현재 공개 라우팅에서는 접근할 수 없다.

## 이번 구조 개편

- `/`는 `DIG. COLLECT. DISPLAY.`와 대표 결과물로 제품을 설명하는 랜딩 화면이다.
- `/create`는 주제, 템플릿, 앨범, 순서·대표 앨범, 제목·설명, 테마, 출력 비율을 고르고 미리 보는 Studio 골격이다.
- `/my-crate`는 CRATEPRINT ARCHIVE와 ALBUM ARCHIVE를 함께 보여준다.
- `/explore`는 공식 예시와 공개 작업물만 보여주는 결과물 중심 갤러리다.
- `/explore/:id`는 전체 CRATEPRINT, 사용 앨범, 같은 템플릿·주제로 만들기 동선을 제공한다.
- `/release/:id`와 `/search`는 기존 앨범·평가 데이터의 손실을 막기 위해 유지한다.
- 이전 공개 URL은 와일드카드로 랜딩에 돌려 현재 UI에서 라운지·커뮤니티가 노출되지 않게 했다.

## 공통 데이터 구조

`src/crateprint.ts`의 `Crateprint` 타입을 기준으로 한다.

- `id`, `ownerId`, `ownerName`
- `title`, `description`, `prompt`
- `templateType`
- `theme`, `outputRatio`
- `selectedAlbums`와 각 앨범의 `order`, 선택적 `score`, `note`
- `heroAlbumId`
- `showScores`, `showNotes`
- `isPublic`
- `createdAt`, `updatedAt`

템플릿은 `display-shelf / ranked-crate / classic-grid`, 테마는 `black-metal / frosted-acrylic / warm-gallery`, 출력 비율은 `4:5 / 9:16 / 1:1 / 16:9`다. 같은 앨범 데이터로 템플릿을 즉시 바꿔 볼 수 있다.

## 구현 상태

- React, TypeScript, Vite 기반 반응형 UI
- 라이트·다크 모드 유지
- CREATE Studio는 회원가입 없이 편집과 미리보기 가능
- 데모 작업은 브라우저 localStorage에 저장
- MY CRATE와 EXPLORE는 샘플 데이터 기반 화면 골격
- 공식 예시는 `CRATEDIGGERS CURATOR`로 명시해 일반 사용자 활동처럼 위장하지 않음
- DISPLAY SHELF는 이전 오리지널 선반형으로 복원됨
- VINYL PEEK, TABLE SPREAD, QUIET RACK을 별도 템플릿으로 추가함
- 기존 RANKED CRATE와 CLASSIC GRID를 포함해 총 6개 템플릿이 같은 공통 앨범 데이터를 사용함

## 다음 작업

### 실제 앨범 데이터 파이프라인

- REVIEW와 CREATE는 Supabase의 `published` 앨범을 우선 읽고, 연결되지 않았거나 데이터가 비어 있으면 샘플 카탈로그를 사용한다.
- `supabase/migrations/20260812_release_ingestion.sql`은 외부 데이터 출처와 동기화 이력 테이블을 추가한다.
- `worker/`의 Cloudflare Worker는 매일 MusicBrainz 신보를 조회해 Supabase에 `draft`로 중복 없이 저장한다.
- 운영 전 `worker/wrangler.toml`의 `SUPABASE_URL`, `MUSICBRAINZ_CONTACT`를 실제 값으로 교체하고 `SUPABASE_SERVICE_ROLE_KEY`, `SYNC_TOKEN`을 Wrangler Secret으로 등록해야 한다.
- GitHub 저장소 Secret에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록해야 GitHub Pages 빌드가 실제 Supabase를 사용한다.

1. RANKED CRATE와 CLASSIC GRID의 출력 비율별 완성도 개선
2. 이미지 내보내기
3. Supabase 인증, CRATEPRINT 저장·공개와 LISTENING LOG 연결
4. 공개·비공개 정책과 재편집·복제·삭제 구현
5. 모바일 앨범 검색·정렬 UX 검증

## 검증

- 최신 TypeScript 검사와 프로덕션 빌드는 통과했다.
- 실제 영구 저장, 공개 링크, 이미지 렌더링은 아직 데모 단계다.
- Supabase 환경 변수가 없으면 데모 모드로 동작한다.

## 다른 컴퓨터에서 이어가기

1. `https://github.com/hjw0602-cloud/CrateClub.git`을 clone한다.
2. `AGENTS.md`와 이 문서를 먼저 읽는다.
3. `.env`는 Git에 포함하지 않으므로 별도로 안전하게 이전한다.
