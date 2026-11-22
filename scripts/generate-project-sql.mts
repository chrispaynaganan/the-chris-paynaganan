// Writes a Studio SQL file for one project from content/projects.ts, like supabase/0003 and 0004.
// Run: node --experimental-strip-types scripts/generate-project-sql.mts <slug> <file-number>
import { writeFileSync } from "node:fs";
import { projects } from "../content/projects.ts";
const [slug, num] = process.argv.slice(2);
const p = projects.find((x) => x.slug === slug);
if (!p || !num) throw new Error("Usage: generate-project-sql.mts <slug> <file-number>");
const json = (v: unknown) => `$j$${JSON.stringify(v)}$j$::jsonb`;
const text = (v: string | undefined | null) => (v == null ? "null" : `$t$${v}$t$`);
const arr = (v: string[]) => `array[${v.map((x) => text(x)).join(", ")}]::text[]`;
const vals = [text(p.slug), 0, "true", text(p.name), text(p.kind), text(p.category), arr(p.tags), arr(p.stamps), p.year,
  text(p.years), text(p.roleShort), text(p.role), text(p.platform), text(p.status), text(p.liveUrl ?? null),
  text(p.docsUrl ?? null), text(p.designSystemUrl ?? null), json(p.screenshots), json(p.facts), json(p.stats), json(p.entries)].join(", ");
const sql = `-- Adds ${p.name.replace(/’/g, "'")} to a Studio that was already seeded, or refreshes it. Safe to run again.
begin;
update public.studio_projects set position = position + 1
  where not exists (select 1 from public.studio_projects where slug = '${p.slug}');
insert into public.studio_projects
  (slug, position, published, name, kind, category, tags, stamps, year, years, role_short, role, platform, status,
   live_url, docs_url, design_system_url, screenshots, facts, stats, entries)
values (${vals})
on conflict (slug) do update set
  name = excluded.name, kind = excluded.kind, category = excluded.category, tags = excluded.tags, stamps = excluded.stamps,
  year = excluded.year, years = excluded.years, role_short = excluded.role_short, role = excluded.role, platform = excluded.platform,
  status = excluded.status, live_url = excluded.live_url, docs_url = excluded.docs_url, design_system_url = excluded.design_system_url,
  screenshots = excluded.screenshots, facts = excluded.facts, stats = excluded.stats, entries = excluded.entries;
commit;
`;
writeFileSync(`supabase/${num.padStart(4, "0")}_${p.slug.replace(/-/g, "_")}.sql`, sql);
console.log("ok", sql.length);
