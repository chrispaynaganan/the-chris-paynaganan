-- SailSwipe: link the clickable prototype (shown as "Try the preview", not a live site) and add real screenshots.
-- Run in Supabase → SQL Editor after the commit with the images has deployed.
update public.studio_projects set
  preview_url = 'https://sailswipe.vercel.app',
  screenshots = $j$[{"label":"Swipe browsing","src":"/projects/sailswipe/swipe.webp"},{"label":"Messaging","src":"/projects/sailswipe/messaging.webp"},{"label":"Boats & opportunities","src":"/projects/sailswipe/posting.webp"},{"label":"Marketplace","src":"/projects/sailswipe/marketplace.webp"},{"label":"Port info","src":"/projects/sailswipe/port.webp"}]$j$::jsonb
where slug = 'sailswipe';
