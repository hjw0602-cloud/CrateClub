# Daily release sync

This Worker imports MusicBrainz release groups into Supabase as reviewable drafts.

1. Apply `supabase/migrations/20260812_release_ingestion.sql` in Supabase SQL Editor.
2. Replace `SUPABASE_URL` and `MUSICBRAINZ_CONTACT` in `wrangler.toml`.
3. Set secrets:
   - `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`
   - `npx wrangler secret put SYNC_TOKEN`
4. Deploy from this directory with `npx wrangler deploy`.

The cron runs daily at `01:17 UTC` (`10:17 KST`). Imported releases remain `draft` until an administrator publishes them.
