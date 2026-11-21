-- the-chris-paynaganan · Studio (CMS)
-- Run once in Supabase → SQL Editor, in the same project as the old site.
-- Safe alongside the old CMS: every new table is prefixed studio_, and the existing
-- public.inquiries table only gains columns (no data is dropped or rewritten).

-- ---------------------------------------------------------------------------
-- Who can edit: only the owner's account. Change the email here if it changes.
-- ---------------------------------------------------------------------------
create or replace function public.studio_is_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'mark.payns@gmail.com';
$$;

create or replace function public.studio_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Projects board
-- ---------------------------------------------------------------------------
create table if not exists public.studio_projects (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position           integer not null default 0,
  published          boolean not null default false,
  name               text not null default '',
  kind               text not null default '',
  category           text not null default '',
  tags               text[] not null default '{}',
  stamps             text[] not null default '{}',
  year               integer not null default extract(year from now())::int,
  years              text not null default '',
  role_short         text not null default '',
  role               text not null default '',
  platform           text not null default '',
  status             text not null default 'live' check (status in ('live', 'not-shipped', 'handed-off')),
  live_url           text,
  docs_url           text,
  design_system_url  text,
  screenshots        jsonb not null default '[]'::jsonb,
  facts              jsonb not null default '[]'::jsonb,
  stats              jsonb not null default '[]'::jsonb,
  entries            jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists studio_projects_touch on public.studio_projects;
create trigger studio_projects_touch before update on public.studio_projects
  for each row execute function public.studio_touch_updated_at();

alter table public.studio_projects enable row level security;

drop policy if exists "studio_projects read" on public.studio_projects;
create policy "studio_projects read" on public.studio_projects
  for select to anon, authenticated
  using (published or public.studio_is_owner());

drop policy if exists "studio_projects owner writes" on public.studio_projects;
create policy "studio_projects owner writes" on public.studio_projects
  for all to authenticated
  using (public.studio_is_owner())
  with check (public.studio_is_owner());

-- ---------------------------------------------------------------------------
-- Business and Site & About boards: one row per item, grouped like a Monday board
-- ---------------------------------------------------------------------------
create table if not exists public.studio_items (
  id          uuid primary key default gen_random_uuid(),
  board       text not null check (board in ('business', 'site')),
  group_key   text not null,
  position    integer not null default 0,
  title       text not null default '',
  data        jsonb not null default '{}'::jsonb,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists studio_items_board_idx on public.studio_items (board, group_key, position);

drop trigger if exists studio_items_touch on public.studio_items;
create trigger studio_items_touch before update on public.studio_items
  for each row execute function public.studio_touch_updated_at();

alter table public.studio_items enable row level security;

drop policy if exists "studio_items read" on public.studio_items;
create policy "studio_items read" on public.studio_items
  for select to anon, authenticated
  using (published or public.studio_is_owner());

drop policy if exists "studio_items owner writes" on public.studio_items;
create policy "studio_items owner writes" on public.studio_items
  for all to authenticated
  using (public.studio_is_owner())
  with check (public.studio_is_owner());

-- ---------------------------------------------------------------------------
-- Inquiries board: the existing table, plus a pipeline stage and notes.
-- The forms keep writing with the server-side key, exactly like the old site.
-- ---------------------------------------------------------------------------
alter table public.inquiries add column if not exists source     text not null default 'project';
alter table public.inquiries add column if not exists reason     text;
alter table public.inquiries add column if not exists message    text;
alter table public.inquiries add column if not exists stage      text not null default 'new';
alter table public.inquiries add column if not exists notes      text;
alter table public.inquiries add column if not exists updated_at timestamptz not null default now();

-- Recruiter messages from /contact don't pick a bundle, so these can be empty now
alter table public.inquiries alter column bundle_category drop not null;
alter table public.inquiries alter column bundle_tier     drop not null;
alter table public.inquiries alter column payment_option  drop not null;
alter table public.inquiries alter column timeline        drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inquiries_stage_check') then
    alter table public.inquiries add constraint inquiries_stage_check
      check (stage in ('new', 'replied', 'call', 'proposal', 'won', 'lost'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'inquiries_source_check') then
    alter table public.inquiries add constraint inquiries_source_check
      check (source in ('project', 'contact'));
  end if;
end $$;

drop trigger if exists inquiries_touch on public.inquiries;
create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.studio_touch_updated_at();

-- Only the owner can read and work the inquiries (the forms write server-side)
drop policy if exists "inquiries owner" on public.inquiries;
create policy "inquiries owner" on public.inquiries
  for all to authenticated
  using (public.studio_is_owner())
  with check (public.studio_is_owner());

-- ---------------------------------------------------------------------------
-- Screenshots and images: public to view, only the owner can upload or change
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('studio-media', 'studio-media', true)
on conflict (id) do nothing;

drop policy if exists "studio-media public read" on storage.objects;
create policy "studio-media public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'studio-media');

drop policy if exists "studio-media owner insert" on storage.objects;
create policy "studio-media owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'studio-media' and public.studio_is_owner());

drop policy if exists "studio-media owner update" on storage.objects;
create policy "studio-media owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'studio-media' and public.studio_is_owner());

drop policy if exists "studio-media owner delete" on storage.objects;
create policy "studio-media owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'studio-media' and public.studio_is_owner());
