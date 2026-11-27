-- Optional: points every Résumé link (footer, menu, About, Contact) at the revised résumé in /public.
-- You can also do this in Studio → Site & About → Profile → Résumé (upload a PDF or paste a link).
update public.studio_items
set data = data || '{"resumeUrl": "/Mark-Christian-Paynaganan-Resume.pdf"}'::jsonb
where board = 'site' and group_key = 'profile';
