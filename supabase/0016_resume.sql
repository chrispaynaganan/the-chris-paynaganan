-- Points every Résumé link (footer, menu, About, Contact) at the revised résumé, served from /public.
-- Run once in Supabase → SQL Editor.
update public.studio_items
set data = data || '{"resumeUrl": "/Mark-Christian-Paynaganan-Resume.pdf"}'::jsonb
where board = 'site' and group_key = 'profile';
