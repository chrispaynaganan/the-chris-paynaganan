import type { Metadata } from "next";
import { getProject, getProjects } from "@/lib/content";
import { ResourcePage } from "@/components/project/ResourcePage";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  return p ? { title: `Design system · ${p.name}` } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourcePage slug={slug} kind="design-system" />;
}
