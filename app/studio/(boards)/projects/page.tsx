import type { Metadata } from "next";
import { ProjectsBoard } from "@/components/studio/ProjectsBoard";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsBoard />;
}
