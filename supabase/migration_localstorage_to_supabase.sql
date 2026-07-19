-- Run this when schema.sql was already applied before the Supabase data migration.
-- It is safe to run more than once.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_nickname text;
begin
  requested_nickname := coalesce(
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'user'
  );

  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    left(requested_nickname, 18) || case
      when exists (
        select 1 from public.profiles
        where nickname = left(requested_nickname, 18)
      ) then '_' || substr(new.id::text, 1, 5)
      else ''
    end,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'artists' and policyname = 'admin artists') then
    create policy "admin artists" on public.artists for all
      using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'))
      with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'releases' and policyname = 'admin releases') then
    create policy "admin releases" on public.releases for all
      using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'))
      with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tracks' and policyname = 'admin tracks') then
    create policy "admin tracks" on public.tracks for all
      using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'))
      with check (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'articles' and policyname = 'editor articles') then
    create policy "editor articles" on public.articles for all
      using (exists(select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')))
      with check (exists(select 1 from public.profiles where id = auth.uid() and role in ('editor','admin')));
  end if;
end
$$;
