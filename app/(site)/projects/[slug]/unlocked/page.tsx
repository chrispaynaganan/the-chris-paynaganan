import type { Metadata } from "next";
import { getProject } from "@/lib/content";
import { isUnlocked } from "@/lib/lock";
import { ProjectView } from "@/components/project/ProjectView";

// proxy.ts sends /projects/<slug> here when the visitor has an unlock cookie or a Studio
// sign-in. Rendered per request because it reads cookies; a bad cookie still gets the password box.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  return p ? { title: `${p.name}: ${p.kind}`, robots: { index: false } } : {};
}

export default async function UnlockedProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const unlocked = project?.locked ? await isUnlocked(slug) : true;
  return <ProjectView slug={slug} unlocked={unlocked} />;
}
