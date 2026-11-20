// The only place pages get content from. Today it reads the files in /content.
// When the CMS lands, these functions will read the database instead and every
// page keeps working unchanged.
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { stampDefs } from "@/content/stamps";
import type { PassportStamp, Project, SiteContent } from "@/types/content";

export async function getSite(): Promise<SiteContent> {
  return site;
}

export async function getProjects(): Promise<Project[]> {
  return [...projects].sort((a, b) => b.year - a.year);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((p) => p.slug === slug);
}

/** Every stamp, earned ones first (with the projects that earned them), then open slots. */
export async function getPassport(): Promise<PassportStamp[]> {
  const all = await getProjects();
  const earned: PassportStamp[] = [];
  const open: PassportStamp[] = [];
  for (const def of stampDefs) {
    const hits = all.filter((p) => p.stamps.includes(def.id));
    if (hits.length) {
      earned.push({
        ...def,
        earned: true,
        year: Math.min(...hits.map((p) => p.year)),
        projects: hits.map((p) => ({ slug: p.slug, name: p.name })),
      });
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

export const categories = [
  { id: "all", label: "All projects" },
  { id: "web", label: "Web design" },
  { id: "mobile", label: "Mobile apps" },
  { id: "saas", label: "SaaS" },
  { id: "health", label: "Healthcare" },
  { id: "market", label: "Marketplaces" },
  { id: "portfolio", label: "Portfolios" },
  { id: "brand", label: "Personal brands" },
] as const;
