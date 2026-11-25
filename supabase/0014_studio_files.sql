-- Private storage for project documents (design systems, documentation PDFs) uploaded in Studio.
-- Nothing here is public: the site serves each file through /files/<slug>/<file>, which checks
-- the NDA lock first (locked projects need the password or your Studio sign-in).
-- Run once in Supabase → SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio-files', 'studio-files', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "studio-files owner read" on storage.objects;
create policy "studio-files owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'studio-files' and public.studio_is_owner());

drop policy if exists "studio-files owner insert" on storage.objects;
create policy "studio-files owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'studio-files' and public.studio_is_owner());

drop policy if exists "studio-files owner update" on storage.objects;
create policy "studio-files owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'studio-files' and public.studio_is_owner());

drop policy if exists "studio-files owner delete" on storage.objects;
create policy "studio-files owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'studio-files' and public.studio_is_owner());
