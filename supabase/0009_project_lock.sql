-- Password protection for NDA projects, plus a second preview link for mobile prototypes.
--
-- * studio_projects.locked: when true, visitors see only the title and a password box.
-- * Passwords live in their own table that nobody can read directly (not even the public site).
--   They are stored as bcrypt hashes; three small functions do the checking.
-- * Changing a password signs out everyone who unlocked with the old one.
--
-- Run once in Supabase → SQL Editor. Safe to run again (it will not reset a password you changed in Studio).
begin;

create extension if not exists pgcrypto with schema extensions;

alter table public.studio_projects add column if not exists locked boolean not null default false;
alter table public.studio_projects add column if not exists preview_mobile_url text;

create table if not exists public.studio_project_secrets (
  slug          text primary key references public.studio_projects (slug) on update cascade on delete cascade,
  password_hash text not null,
  updated_at    timestamptz not null default now()
);
alter table public.studio_project_secrets enable row level security;
-- No policies on purpose: the table is only reachable through the functions below.

-- Owner only: set or change a project's password (and switch the lock on).
create or replace function public.studio_set_project_password(p_slug text, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.studio_is_owner() then
    raise exception 'Only the Studio owner can set project passwords';
  end if;
  if coalesce(length(trim(p_password)), 0) < 4 then
    raise exception 'Use at least 4 characters';
  end if;
  insert into public.studio_project_secrets (slug, password_hash, updated_at)
  values (p_slug, crypt(trim(p_password), gen_salt('bf', 10)), now())
  on conflict (slug) do update set password_hash = excluded.password_hash, updated_at = now();
  update public.studio_projects set locked = true where slug = p_slug;
end;
$$;

-- Owner only: is a password set? (Studio shows this; it never sees the password itself.)
create or replace function public.studio_project_has_password(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.studio_is_owner() and exists (select 1 from public.studio_project_secrets where slug = p_slug);
$$;

-- Anyone: trade the right password for an unlock token (null when wrong).
-- The token is derived from the stored hash, so it stops working when the password changes.
create or replace function public.studio_unlock_project(p_slug text, p_password text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  h text;
begin
  select password_hash into h from public.studio_project_secrets where slug = p_slug;
  if h is null or h <> crypt(trim(coalesce(p_password, '')), h) then
    perform pg_sleep(0.4);
    return null;
  end if;
  return encode(digest(p_slug || ':' || h, 'sha256'), 'hex');
end;
$$;

-- Anyone: is this unlock token still valid?
create or replace function public.studio_check_project_token(p_slug text, p_token text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.studio_project_secrets
    where slug = p_slug and encode(digest(p_slug || ':' || password_hash, 'sha256'), 'hex') = p_token
  );
$$;

revoke all on function public.studio_set_project_password(text, text) from public;
revoke all on function public.studio_project_has_password(text) from public;
grant execute on function public.studio_set_project_password(text, text) to authenticated;
grant execute on function public.studio_project_has_password(text) to authenticated;
grant execute on function public.studio_unlock_project(text, text) to anon, authenticated;
grant execute on function public.studio_check_project_token(text, text) to anon, authenticated;

-- CISHIFTS: under NDA with a starter password ("cishifts"), both previews, and real screenshots.
-- Screenshots are served from /nda/..., which only answers once the visitor has unlocked the project.
insert into public.studio_project_secrets (slug, password_hash)
select 'cishifts', extensions.crypt('cishifts', extensions.gen_salt('bf', 10))
where exists (select 1 from public.studio_projects where slug = 'cishifts')
on conflict (slug) do nothing;

update public.studio_projects set
  locked = true,
  preview_url = 'https://cishifts.vercel.app',
  preview_mobile_url = 'https://cishifts.vercel.app/nurse',
  platform = 'Mobile app + web dashboard',
  screenshots = $j$[{"label":"Clinic calendar","src":"/nda/cishifts/clinic-calendar.webp"},{"label":"Shift popovers","src":"/nda/cishifts/clinic-shift-popover.webp"},{"label":"Nurse app: finding shifts","src":"/nda/cishifts/nurse-finding-shifts.webp"},{"label":"Nurse app: working a shift","src":"/nda/cishifts/nurse-working-a-shift.webp"},{"label":"Clinic sign-up","src":"/nda/cishifts/clinic-sign-up.webp"}]$j$::jsonb
where slug = 'cishifts';

commit;
