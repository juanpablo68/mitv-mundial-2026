-- MiTV Mundial 2026 - Supabase schema
-- Ejecutar en Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id text primary key,
  round text not null,
  group_code text,
  match_date date not null,
  day_label text not null,
  match_time time not null,
  home_team text not null,
  away_team text not null,
  status text not null default 'scheduled',
  external_fixture_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_channels (
  id text primary key,
  name text not null unique,
  country text,
  created_at timestamptz not null default now()
);

create table if not exists public.transmissions (
  id bigserial primary key,
  match_id text not null references public.matches(id) on delete cascade,
  media_id text not null references public.media_channels(id) on delete cascade,
  unique(match_id, media_id)
);

create table if not exists public.results (
  match_id text primary key references public.matches(id) on delete cascade,
  home_score int,
  away_score int,
  status text not null default 'scheduled',
  source text,
  updated_at timestamptz not null default now(),
  constraint results_scores_non_negative check (
    (home_score is null or home_score >= 0) and
    (away_score is null or away_score >= 0)
  )
);

create table if not exists public.predictions (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  winner text not null default '' check (winner in ('home','draw','away','')),
  home_score text not null default '',
  away_score text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create table if not exists public.user_media_selection (
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  media_id text not null references public.media_channels(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_matches_updated_at on public.matches;
create trigger touch_matches_updated_at before update on public.matches
for each row execute function public.touch_updated_at();

drop trigger if exists touch_predictions_updated_at on public.predictions;
create trigger touch_predictions_updated_at before update on public.predictions
for each row execute function public.touch_updated_at();

drop trigger if exists touch_user_media_selection_updated_at on public.user_media_selection;
create trigger touch_user_media_selection_updated_at before update on public.user_media_selection
for each row execute function public.touch_updated_at();

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = uid and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.media_channels enable row level security;
alter table public.transmissions enable row level security;
alter table public.results enable row level security;
alter table public.predictions enable row level security;
alter table public.user_media_selection enable row level security;

drop policy if exists "Profiles can read own profile" on public.profiles;
create policy "Profiles can read own profile" on public.profiles
for select using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles
for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Anyone can read matches" on public.matches;
create policy "Anyone can read matches" on public.matches for select using (true);

drop policy if exists "Admins manage matches" on public.matches;
create policy "Admins manage matches" on public.matches
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Anyone can read media" on public.media_channels;
create policy "Anyone can read media" on public.media_channels for select using (true);

drop policy if exists "Admins manage media" on public.media_channels;
create policy "Admins manage media" on public.media_channels
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Anyone can read transmissions" on public.transmissions;
create policy "Anyone can read transmissions" on public.transmissions for select using (true);

drop policy if exists "Admins manage transmissions" on public.transmissions;
create policy "Admins manage transmissions" on public.transmissions
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Anyone can read results" on public.results;
create policy "Anyone can read results" on public.results for select using (true);

drop policy if exists "Admins manage results" on public.results;
create policy "Admins manage results" on public.results
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Users read own predictions" on public.predictions;
create policy "Users read own predictions" on public.predictions for select using (auth.uid() = user_id);

drop policy if exists "Users insert own predictions" on public.predictions;
create policy "Users insert own predictions" on public.predictions for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own predictions" on public.predictions;
create policy "Users update own predictions" on public.predictions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own predictions" on public.predictions;
create policy "Users delete own predictions" on public.predictions for delete using (auth.uid() = user_id);

drop policy if exists "Users read own media selection" on public.user_media_selection;
create policy "Users read own media selection" on public.user_media_selection for select using (auth.uid() = user_id);

drop policy if exists "Users insert own media selection" on public.user_media_selection;
create policy "Users insert own media selection" on public.user_media_selection for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own media selection" on public.user_media_selection;
create policy "Users update own media selection" on public.user_media_selection for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own media selection" on public.user_media_selection;
create policy "Users delete own media selection" on public.user_media_selection for delete using (auth.uid() = user_id);
