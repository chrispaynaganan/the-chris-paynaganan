// The only place pages get content from.
// With Supabase set up, content comes from the Studio tables (published rows only).
// If Supabase isn't configured, is unreachable, or a table is still empty, it falls back
// to the files in /content, so the site never breaks while Studio is being set up.
import { cache } from "react";
import { projects as fileProjects } from "@/content/projects";
import { site as fileSite } from "@/content/site";
import { stampDefs as fileStamps } from "@/content/stamps";
import { privacy as filePrivacy, terms as fileTerms, type LegalDoc } from "@/content/legal";
import { publicClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { PassportStamp, Project, SiteContent, StampDef } from "@/types/content";

export { categories } from "./categories";

type ProjectRow = {
  slug: string; position: number; name: string; kind: string; category: string; tags: string[]; stamps: string[];
  year: number; years: string; role_short: string; role: string; platform: string; status: Project["status"];
  live_url: string | null; preview_url?: string | null; docs_url: string | null; design_system_url: string | null;
  screenshots: Project["screenshots"]; facts: Project["facts"]; stats: Project["stats"]; entries: Project["entries"];
};
type ItemRow = { board: "business" | "site"; group_key: string; position: number; title: string; data: Record<string, unknown> };

const nonEmpty = <T,>(v: T | null | undefined): v is T => v != null && v !== "";

const byYear = (list: Project[]) => [...list].sort((a, b) => b.year - a.year);

/** In Studio's order (drag rows to change it). The file fallback is newest first. */
const loadProjects = cache(async (): Promise<Project[]> => {
  if (!supabaseConfigured) return byYear(fileProjects);
  try {
    const { data, error } = await publicClient().from("studio_projects").select("*").eq("published", true).order("position");
    if (error || !data?.length) return byYear(fileProjects);
    return (data as ProjectRow[]).map((r) => ({
      slug: r.slug, name: r.name, kind: r.kind, category: r.category, tags: r.tags ?? [], stamps: r.stamps ?? [],
      year: r.year, years: r.years, roleShort: r.role_short, role: r.role, platform: r.platform, status: r.status,
      liveUrl: r.live_url || undefined, previewUrl: r.preview_url || undefined, docsUrl: r.docs_url || undefined, designSystemUrl: r.design_system_url || undefined,
      screenshots: r.screenshots ?? [], facts: r.facts ?? [], stats: r.stats ?? [], entries: r.entries ?? [],
    }));
  } catch {
    return byYear(fileProjects);
  }
});

const loadItems = cache(async (): Promise<ItemRow[] | null> => {
  if (!supabaseConfigured) return null;
  try {
    const { data, error } = await publicClient().from("studio_items").select("board, group_key, position, title, data").eq("published", true).order("position");
    if (error || !data?.length) return null;
    return data as ItemRow[];
  } catch {
    return null;
  }
});

const group = (items: ItemRow[], board: ItemRow["board"], key: string) => items.filter((i) => i.board === board && i.group_key === key);
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

const loadSite = cache(async (): Promise<SiteContent> => {
  const items = await loadItems();
  if (!items) return fileSite;
  const p = group(items, "site", "profile")[0]?.data ?? {};
  const biz = group(items, "business", "settings")[0]?.data ?? {};
  const enterprise = (p.enterprise as SiteContent["enterprise"]) ?? fileSite.enterprise;
  const s: SiteContent = {
    name: str(p.name, fileSite.name),
    role: str(p.role, fileSite.role),
    location: str(p.location, fileSite.location),
    email: str(p.email, fileSite.email),
    replyTime: str(p.replyTime, fileSite.replyTime),
    tagline: str(p.tagline, fileSite.tagline),
    calendlyUrl: str(p.calendlyUrl, fileSite.calendlyUrl),
    resumeUrl: str(p.resumeUrl),
    enterprise,
    socials: group(items, "site", "socials").map((i) => ({ label: i.title, url: str(i.data.url) })).filter((x) => nonEmpty(x.url)),
    heroLine: str(p.heroLine, fileSite.heroLine),
    hostTeaser: str(p.hostTeaser, fileSite.hostTeaser),
    story: group(items, "site", "story").map((i) => str(i.data.body)).filter(nonEmpty),
    karinderya: str(group(items, "site", "karinderya")[0]?.data.body, fileSite.karinderya),
    interests: group(items, "site", "interests").map((i) => i.title),
    houseRules: group(items, "site", "house-rules").map((i) => ({ title: i.title, body: str(i.data.body) })),
    tools: group(items, "site", "tools").map((i) => ({ group: i.title, items: strs(i.data.items) })),
    inTheWorks: str(p.inTheWorks, fileSite.inTheWorks),
    testimonials: group(items, "site", "testimonials").map((i) => ({ name: i.title, title: str(i.data.title), year: str(i.data.year), quote: str(i.data.quote) })),
    gallery: group(items, "site", "gallery").map((i) => ({
      title: i.title, date: str(i.data.date),
      category: (["web", "mobile"].includes(str(i.data.category)) ? str(i.data.category) : undefined) as "web" | "mobile" | undefined,
      src: str(i.data.src) || undefined,
    })),
    business: {
      intro: str(biz.intro, fileSite.business.intro),
      bundles: group(items, "business", "bundles").map((i) => ({
        name: i.title,
        payInFull: (i.data.payInFull as { usd: string; php: string }) ?? { usd: "", php: "" },
        installments: (i.data.installments as { usd: string; php: string }) ?? { usd: "", php: "" },
        save: str(i.data.save) || undefined,
        popular: Boolean(i.data.popular),
        items: strs(i.data.items),
      })),
      businessBundles: group(items, "business", "business-bundles").map((i) => i.title),
      addons: group(items, "business", "addons").map((i) => ({ name: i.title, usd: str(i.data.usd), php: str(i.data.php), description: str(i.data.description) })),
      process: group(items, "business", "process").map((i) => ({ title: i.title, body: str(i.data.body) })),
      faqs: group(items, "business", "faq").map((i) => ({ q: i.title, a: str(i.data.a) })),
      paymentOptions: strs(biz.paymentOptions).length ? strs(biz.paymentOptions) : fileSite.business.paymentOptions,
      timelines: strs(biz.timelines).length ? strs(biz.timelines) : fileSite.business.timelines,
    },
  };
  // Any list left empty in Studio falls back to the file version rather than vanishing from the site
  if (!s.socials.length) s.socials = fileSite.socials;
  if (!s.story.length) s.story = fileSite.story;
  if (!s.business.bundles.length) s.business.bundles = fileSite.business.bundles;
  return s;
});

const loadStampDefs = cache(async (): Promise<StampDef[]> => {
  const items = await loadItems();
  const rows = items ? group(items, "site", "niches") : [];
  if (!rows.length) return fileStamps;
  return rows.map((i) => ({
    id: str(i.data.id) || i.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: i.title,
    motto: str(i.data.motto),
    shape: i.data.shape === "rect" ? "rect" : "circle",
  }));
});

export async function getSite(): Promise<SiteContent> {
  return loadSite();
}

export async function getProjects(): Promise<Project[]> {
  return loadProjects();
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await loadProjects()).find((p) => p.slug === slug);
}

export async function getLegal(key: "privacy" | "terms"): Promise<LegalDoc> {
  const items = await loadItems();
  const row = items ? group(items, "site", "legal").find((i) => i.data.key === key) : undefined;
  const fallback = key === "privacy" ? filePrivacy : fileTerms;
  if (!row) return fallback;
  const d = row.data as Partial<LegalDoc>;
  return { title: row.title || fallback.title, updated: d.updated ?? fallback.updated, intro: d.intro ?? fallback.intro, sections: d.sections ?? fallback.sections };
}

/** Every stamp, earned ones first (with the projects that earned them), then open slots. */
export async function getPassport(): Promise<PassportStamp[]> {
  const [all, defs] = await Promise.all([getProjects(), loadStampDefs()]);
  const earned: PassportStamp[] = [];
  const open: PassportStamp[] = [];
  for (const def of defs) {
    const hits = all.filter((p) => p.stamps.includes(def.id));
    if (hits.length) {
      earned.push({ ...def, earned: true, year: Math.min(...hits.map((p) => p.year)), projects: hits.map((p) => ({ slug: p.slug, name: p.name })) });
    } else {
      open.push({ ...def, earned: false });
    }
  }
  return [...earned, ...open];
}

export async function getStampsFor(project: Project): Promise<PassportStamp[]> {
  const passport = await getPassport();
  return passport.filter((s) => s.earned && project.stamps.includes(s.id));
}
