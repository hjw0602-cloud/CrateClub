# CRATEDIGGERS 작업 인계

업데이트: 2026-08-12

## 프로젝트

- 저장소: https://github.com/hjw0602-cloud/CrateClub.git
- 배포: https://hjw0602-cloud.github.io/CrateClub/#/create
- 기술: React, TypeScript, Vite, Supabase, Cloudflare Worker, GitHub Pages
- 핵심 메뉴: CREATE / REVIEW / BOARD / MY CRATE
- 제품 핵심: 음악 취향을 기록하고 9장의 앨범으로 CRATEPRINT를 만드는 서비스

## 현재 구현

### CREATE

- 제목과 한 줄 설명 편집
- CLASSIC GRID, DISPLAY SHELF, CRATE PILE 템플릿
- 1~9 앨범 슬롯을 세로 목록으로 표시
- 오른쪽 미리보기의 커버를 누르면 동일한 슬롯 선택
- Last.fm 전체 앨범 검색
- 검색한 앨범을 선택하면 Supabase에 자체 앨범 ID로 저장
- 모바일에는 접을 수 있는 상단 고정 미니 미리보기 제공
- PC에는 우측 전체 LIVE PREVIEW 유지
- 이미지 다운로드, SNS 공유, 저장 UI

### 데이터 원칙

- CREATE 검색과 커버: Last.fm
- REVIEW의 앨범 식별과 상세 메타데이터: MusicBrainz
- 리뷰, 보드, 사용자 기록의 기준: Supabase의 자체 release ID
- Last.fm과 MusicBrainz의 외부 ID는 보조 식별자로 사용
- 매일 발매 앨범은 Cloudflare Worker가 MusicBrainz에서 수집해 draft로 저장

### 서버

- Worker: https://cratediggers-release-sync.hjw0602.workers.dev
- 매일 동기화 일정: 01:17 UTC, 한국 시간 10:17
- Worker 비밀값은 Cloudflare에만 저장됨:
  - SUPABASE_SERVICE_ROLE_KEY
  - SYNC_TOKEN
  - LASTFM_API_KEY
- 비밀값을 GitHub, HANDOFF.md, .env.example에 실제 값으로 기록하지 말 것

## 다른 컴퓨터에서 시작하기

```bash
git clone https://github.com/hjw0602-cloud/CrateClub.git
cd CrateClub
pnpm install
pnpm run build
pnpm run dev
```

이미 저장소가 있다면:

```bash
git pull origin main
pnpm install
pnpm run build
```

로컬에서 Supabase 기능까지 사용하려면 `.env.example`을 참고해 `.env`를 만들고 다음 공개 프론트엔드 값만 설정한다.

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY`와 `LASTFM_API_KEY`는 로컬 프론트엔드 `.env`에 넣지 않는다. 배포된 Worker가 이 비밀값을 관리한다.

## 새 Codex 대화에서 전달할 문장

아래 문장을 새 컴퓨터의 Codex에 전달하면 된다.

> 이 프로젝트는 GitHub main에 최신 작업이 있습니다. 저장소는 https://github.com/hjw0602-cloud/CrateClub.git 입니다. 현재 폴더가 CrateClub 프로젝트인지 확인하고 AGENTS.md와 HANDOFF.md를 읽은 뒤, git status와 git remote -v를 확인하고 git pull origin main, pnpm install, pnpm run build 순서로 최신화해주세요. CREATE는 Last.fm 검색, REVIEW 메타데이터는 MusicBrainz, 내부 연결은 Supabase release ID를 기준으로 합니다.

## 다음 작업 후보

- CREATE의 내 리뷰 앨범 및 별점 구간 필터
- Last.fm 결과와 MusicBrainz 리뷰 작품의 백그라운드 매칭
- 실제 CRATEPRINT 저장 및 사용자별 MY CRATE 연결
- Canvas 기반 실제 이미지 다운로드
- REVIEW에 운영자 승인 신보와 실제 사용자 리뷰 연결
- 선택한 로고 시안 확정 및 SVG/파비콘 제작

## 검증 참고

- 프로덕션 빌드는 통과함
- GitHub Pages는 HashRouter를 사용함
- 배포 후 오래된 화면이 보이면 강력 새로고침 후 다시 확인
- Windows 로컬 dev 서버에서 의존성 해석 문제가 발생한 적이 있으므로, 이상하면 `node_modules`를 재설치하되 사용자 변경 파일은 삭제하지 말 것
