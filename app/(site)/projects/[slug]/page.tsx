import type { Metadata } from "next";
import { getProject, getProjects } from "@/lib/content";
import { ProjectView } from "@/components/project/ProjectView";

export async function generateStaticParams() {
  const projects = await getProjects();
  // NDA projects render per visit (they check the unlock cookie), so they aren't built ahead
  return projects.filter((p) => !p.locked).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  if (p.locked) return { title: `${p.name}: ${p.kind}`, description: `${p.name} is under NDA. Ask Chris for the password.`, robots: { index: false } };
  return { title: `${p.name}: ${p.kind}`, description: p.entries[0]?.body };
}

// Static for everyone. Visitors who unlocked an NDA project (or the Studio owner) are
// rewritten by proxy.ts to ./unlocked, which checks the cookie and shows the full page.
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectView slug={slug} />;
}
