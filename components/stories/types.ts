import type { DiaryEntry, ProjectStatus } from "@/types/content";

export type StoryProject = {
  slug: string;
  name: string;
  kind: string;
  years: string;
  status: ProjectStatus;
  entries: DiaryEntry[];
};
