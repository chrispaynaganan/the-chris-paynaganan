-- Adds two more screenshots each to Oh, Yvi! and Boses Filipina, so their photo grids are full.
-- Only touches the screenshot lists; everything else you've edited in Studio stays. Safe to run again.
begin;
update public.studio_projects set screenshots = $j$[{"label":"Homepage","src":"/projects/oh-yvi/home.webp"},{"label":"Collections","src":"/projects/oh-yvi/collections.webp"},{"label":"Affiliate program","src":"/projects/oh-yvi/affiliate.webp"},{"label":"About the brand","src":"/projects/oh-yvi/about.webp"},{"label":"Articles","src":"/projects/oh-yvi/articles.webp"}]$j$::jsonb where slug = 'oh-yvi';
update public.studio_projects set screenshots = $j$[{"label":"Scrapbook homepage","src":"/projects/boses-filipina/home.webp"},{"label":"Cassette demo reels","src":"/projects/boses-filipina/demos.webp"},{"label":"Her Studio","src":"/projects/boses-filipina/studio.webp"},{"label":"Video reels","src":"/projects/boses-filipina/reels.webp"},{"label":"Voice rate card","src":"/projects/boses-filipina/rates.webp"}]$j$::jsonb where slug = 'boses-filipina';
commit;
