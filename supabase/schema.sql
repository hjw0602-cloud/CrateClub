create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'editor', 'admin');
create type public.release_type as enum ('ALBUM', 'EP', 'MIXTAPE', 'SINGLE');
create type public.content_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null check (char_length(nickname) between 2 and 24),
  avatar_url text,
  bio text check (char_length(bio) <= 160),
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_nickname text;
begin
  requested_nickname := coalesce(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'user');
  insert into public.profiles (id, nickname, avatar_url)
  values (new.id, left(requested_nickname, 18) || case when exists(select 1 from public.profiles where nickname = left(requested_nickname, 18)) then '_' || substr(new.id::text, 1, 5) else '' end, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  musicbrainz_id uuid unique,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id),
  title text not null,
  slug text unique not null,
  release_type release_type not null,
  release_date date,
  genres text[] not null default '{}',
  description text,
  cover_url text,
  musicbrainz_id uuid unique,
  spotify_url text,
  apple_music_url text,
  youtube_music_url text,
  status content_status not null default 'draft',
  created_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  position smallint not null,
  title text not null,
  duration_ms integer,
  unique(release_id, position)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(3,1) not null check (score >= 0 and score <= 10),
  body text check (char_length(body) <= 300),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(release_id, user_id)
);

create table public.review_likes (
  review_id uuid references public.reviews(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(review_id, user_id)
);

create table public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  title text not null,
  slug text unique not null,
  category text not null check (category in ('리뷰','비평','인터뷰','큐레이션','뉴스')),
  excerpt text,
  body text not null,
  cover_url text,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  board text not null check (board in ('자유','국내 음악','해외 음악')),
  title text not null check (char_length(title) <= 120),
  body text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 1000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check ((post_id is not null)::int + (article_id is not null)::int = 1)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('review','reply','post','comment')),
  target_id uuid not null,
  reason text not null check (reason in ('욕설','도배','혐오','기타')),
  details text,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(reporter_id, target_type, target_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null,
  target_type text,
  target_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;
alter table public.review_replies enable row level security;
alter table public.follows enable row level security;
alter table public.articles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create policy "public profiles" on public.profiles for select using (true);
create policy "own profile" on public.profiles for update using (auth.uid() = id);
create policy "public artists" on public.artists for select using (true);
create policy "admin artists" on public.artists for all using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')) with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "published releases" on public.releases for select using (status = 'published' or created_by = auth.uid());
create policy "admin releases" on public.releases for all using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')) with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "public tracks" on public.tracks for select using (true);
create policy "admin tracks" on public.tracks for all using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')) with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "public reviews" on public.reviews for select using (deleted_at is null);
create policy "own review insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "own review update" on public.reviews for update using (auth.uid() = user_id);
create policy "public likes" on public.review_likes for select using (true);
create policy "own likes" on public.review_likes for insert with check (auth.uid() = user_id);
create policy "remove own likes" on public.review_likes for delete using (auth.uid() = user_id);
create policy "public replies" on public.review_replies for select using (deleted_at is null);
create policy "own reply" on public.review_replies for insert with check (auth.uid() = user_id);
create policy "public follows" on public.follows for select using (true);
create policy "own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "remove own follows" on public.follows for delete using (auth.uid() = follower_id);
create policy "published articles" on public.articles for select using (status = 'published');
create policy "editor articles" on public.articles for all using (exists(select 1 from public.profiles where id = auth.uid() and role in ('editor','admin'))) with check (exists(select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')));
create policy "public posts" on public.posts for select using (deleted_at is null);
create policy "own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "public comments" on public.comments for select using (deleted_at is null);
create policy "own comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "own reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "own notifications" on public.notifications for select using (auth.uid() = user_id);

create index reviews_release_created_idx on public.reviews(release_id, created_at desc) where deleted_at is null;
create index reviews_user_idx on public.reviews(user_id, created_at desc) where deleted_at is null;
create index releases_date_idx on public.releases(release_date desc) where status = 'published';
create index posts_board_created_idx on public.posts(board, created_at desc) where deleted_at is null;
