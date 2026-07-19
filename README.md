# CRATEDIGGERS

힙합과 R&B를 중심으로 신보를 발견하고 10점 만점의 별점과 한줄평을 나누는 음악 커뮤니티입니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

Supabase 연결 전에는 브라우저 `localStorage` 기반 데모 모드로 모든 주요 흐름을 체험할 수 있습니다.

## Supabase 연결

1. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. `.env.example`을 `.env`로 복사하고 URL과 anon key를 입력합니다.
3. Supabase Auth에서 Email과 Kakao provider를 활성화합니다.
4. `covers`, `avatars`, `magazine` Storage bucket을 생성합니다.

## Cloudflare Pages

- Build command: `pnpm build`
- Build output: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Pages Function secret: `MUSICBRAINZ_CONTACT`

`functions/api/musicbrainz.ts`는 관리자 작품 등록 화면에서 MusicBrainz 메타데이터 초안을 만드는 서버 엔드포인트입니다.
