# CRATEDIGGERS

힙합과 R&B를 중심으로 신보를 발견하고 10점 만점의 별점과 한줄평을 나누는 음악 커뮤니티입니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

Supabase 연결 전에는 새로고침 시 초기화되는 메모리 데모 모드로 주요 흐름을 체험할 수 있습니다.

## Supabase 연결

1. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. 같은 SQL Editor에서 `supabase/seed.sql`을 실행해 화면의 초기 작품 6개를 DB와 연결합니다.
3. `.env.example`을 `.env`로 복사하고 URL과 publishable key를 입력합니다.
4. Supabase Auth에서 Email과 Kakao provider를 활성화합니다.
5. `covers`, `avatars`, `magazine` Storage bucket을 생성합니다.

Supabase 환경 변수가 있으면 인증, 리뷰, 답글, 좋아요, 팔로우, 게시글이 DB에 저장됩니다. 환경 변수가 없는 로컬 실행은 새로고침 시 초기화되는 메모리 데모를 사용합니다. 테마 설정만 브라우저에 저장됩니다.

이미 이전 버전의 `schema.sql`을 실행한 프로젝트에서는 스키마 전체를 다시 실행하지 말고 `supabase/migration_localstorage_to_supabase.sql`을 실행한 다음 `supabase/seed.sql`을 실행합니다.

## Cloudflare Pages

- Build command: `pnpm build`
- Build output: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Pages Function secret: `MUSICBRAINZ_CONTACT`

`functions/api/musicbrainz.ts`는 관리자 작품 등록 화면에서 MusicBrainz 메타데이터 초안을 만드는 서버 엔드포인트입니다.
