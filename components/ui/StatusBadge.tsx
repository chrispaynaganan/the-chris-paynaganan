import { cn } from "@/lib/cn";
import type { ProjectStatus } from "@/types/content";

export const statusInfo: Record<ProjectStatus, { label: string; tone: "ok" | "warn" | "info"; note: string }> = {
  live: { label: "Live", tone: "ok", note: "Live and shipped. Built and launched, start to finish." },
  "not-shipped": { label: "Not shipped", tone: "warn", note: "Never shipped. The design and documentation are complete." },
  "handed-off": { label: "Handed off", tone: "info", note: "Delivered as developer-ready Figma files." },
};

export const toneClass = {
  ok: "bg-ok-bg text-ok",
  info: "bg-info-bg text-info",
  warn: "bg-warn-bg text-warn",
  error: "bg-error-bg text-error",
} as const;

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const s = statusInfo[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", toneClass[s.tone], className)}>
      {s.label}
    </span>
  );
}
