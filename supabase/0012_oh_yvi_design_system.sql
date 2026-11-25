-- Oh, Yvi!: link the design system PDF (opens in the site's reader).
-- Run in Supabase → SQL Editor after the commit with the PDF has deployed.
update public.studio_projects set design_system_url = '/docs/oh-yvi-design-system.pdf' where slug = 'oh-yvi';
