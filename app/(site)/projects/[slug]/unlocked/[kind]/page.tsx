import { notFound } from "next/navigation";
import { getProject } from "@/lib/content";
import { isUnlocked } from "@/lib/lock";
import { ResourcePage } from "@/components/project/ResourcePage";

// Documentation / design system of an NDA project, for visitors who unlocked it (see proxy.ts).
export const dynamic = "force-dynamic";

export default async function UnlockedResource({ params }: { params: Promise<{ slug: string; kind: string }> }) {
  const { slug, kind } = await params;
  if (kind !== "documentation" && kind !== "design-system") notFound();
  const project = await getProject(slug);
  return <ResourcePage slug={slug} kind={kind} unlocked={project?.locked ? await isUnlocked(slug) : true} />;
}
