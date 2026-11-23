-- Adds a "preview" link for clickable prototypes of work that never shipped
-- (shown as "Try the preview", never as a live site), and sets it for CISHIFTS.
-- Only adds a column and touches that one field. Safe to run again.
begin;
alter table public.studio_projects add column if not exists preview_url text;
update public.studio_projects set preview_url = 'https://cishifts.vercel.app' where slug = 'cishifts';
commit;
