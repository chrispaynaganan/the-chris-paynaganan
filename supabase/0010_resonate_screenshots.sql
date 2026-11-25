-- Resonate: real screenshots of Erwin's site (files are in public/projects/resonate/).
-- Run in Supabase → SQL Editor after the commit with the images has deployed.
update public.studio_projects set
  live_url = 'https://erwin-natividad-2026.vercel.app/',
  screenshots = $j$[{"label":"Homepage","src":"/projects/resonate/home.webp"},{"label":"Discovery-call booking","src":"/projects/resonate/discovery-call.webp"},{"label":"Projects","src":"/projects/resonate/projects.webp"},{"label":"Services","src":"/projects/resonate/services.webp"},{"label":"Project page","src":"/projects/resonate/project-page.webp"}]$j$::jsonb
where slug = 'resonate';
