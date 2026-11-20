import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { toneClass } from "./StatusBadge";

const icons = { ok: CircleCheck, info: Info, warn: TriangleAlert, error: CircleAlert };

export function Notice({
  tone,
  children,
  className,
  role = "note",
}: {
  tone: keyof typeof icons;
  children: React.ReactNode;
  className?: string;
  role?: "note" | "status" | "alert";
}) {
  const Icon = icons[tone];
  return (
    <div role={role} className={cn("flex items-start gap-2.5 rounded-xl px-4 py-3.5 text-sm", toneClass[tone], className)}>
      <Icon aria-hidden className="mt-0.5 size-4.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
