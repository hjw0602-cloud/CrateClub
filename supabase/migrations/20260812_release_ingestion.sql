alter table public.releases
  add column if not exists source text not null default 'manual',
  add column if not exists source_payload jsonb,
  add column if not exists imported_at timestamptz,
  add column if not exists last_synced_at timestamptz;

create table if not exists public.release_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  target_date date not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  discovered_count integer not null default 0,
  imported_count integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.release_sync_runs enable row level security;

drop policy if exists "admin sync runs" on public.release_sync_runs;
create policy "admin sync runs" on public.release_sync_runs for select
using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create index if not exists releases_source_date_idx
  on public.releases(source, release_date desc);

create index if not exists release_sync_runs_target_idx
  on public.release_sync_runs(target_date desc, started_at desc);
