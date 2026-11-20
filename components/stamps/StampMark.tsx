import { useId } from "react";
import { cn } from "@/lib/cn";
import type { PassportStamp } from "@/types/content";

function splitLabel(label: string) {
  const words = label.toUpperCase().split(" ");
  if (label.length <= 10 || words.length === 1) return [words.join(" ")];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/** The stamp artwork itself: an ink-style circle or rectangle. Open slots are dashed and grey. */
export function StampMark({ stamp, className }: { stamp: PassportStamp; className?: string }) {
  const raw = useId();
  const id = `arc-${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const lines = splitLabel(stamp.label);
  const earned = stamp.earned;
  const bottom = earned ? String(stamp.year) : "NEXT STOP";
  const dash = earned ? undefined : "6 6";

  return (
    <svg
      viewBox="0 0 160 160"
      role="img"
      aria-label={earned ? `${stamp.label} stamp, first earned ${stamp.year}` : `${stamp.label}: not stamped yet`}
      className={cn("w-full", earned ? "text-ink" : "text-field", className)}
    >
      {stamp.shape === "circle" ? (
        <>
          <defs>
            <path id={id} d="M80,80 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0" />
          </defs>
          <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray={dash} />
          <circle cx="80" cy="80" r="64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray={dash} />
          <text fill="currentColor" fontSize="9.5" fontWeight="700" letterSpacing="2.6">
            <textPath href={`#${id}`} startOffset="2%">
              {`${stamp.motto.toUpperCase()} · CHRIS PAYNAGANAN · `}
            </textPath>
          </text>
          <line x1="40" x2="120" y1={lines.length > 1 ? 58 : 64} y2={lines.length > 1 ? 58 : 64} stroke="currentColor" strokeWidth="1.2" />
          {lines.map((l, i) => (
            <text key={l} x="80" y={(lines.length > 1 ? 76 : 86) + i * 17} textAnchor="middle" fill="currentColor" fontSize={l.length > 9 ? 13 : 17} fontWeight="800" letterSpacing="1">
              {l}
            </text>
          ))}
          <line x1="40" x2="120" y1={lines.length > 1 ? 102 : 96} y2={lines.length > 1 ? 102 : 96} stroke="currentColor" strokeWidth="1.2" />
          <text x="80" y="117" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="700" letterSpacing="2">
            {bottom}
          </text>
        </>
      ) : (
        <>
          <rect x="6" y="24" width="148" height="112" rx="12" fill="none" stroke="currentColor" strokeWidth="3.5" strokeDasharray={dash} />
          <rect x="14" y="32" width="132" height="96" rx="6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray={earned ? "3 3" : dash} />
          <text x="80" y="50" textAnchor="middle" fill="currentColor" fontSize="8.5" fontWeight="700" letterSpacing="2.2">
            {stamp.motto.toUpperCase()}
          </text>
          {lines.map((l, i) => (
            <text key={l} x="80" y={(lines.length > 1 ? 76 : 86) + i * 17} textAnchor="middle" fill="currentColor" fontSize={l.length > 9 ? 13 : 18} fontWeight="800" letterSpacing="1">
              {l}
            </text>
          ))}
          <text x="80" y="118" textAnchor="middle" fill="currentColor" fontSize="9.5" fontWeight="700" letterSpacing="2">
            {earned ? `★ ${bottom} ★` : bottom}
          </text>
        </>
      )}
    </svg>
  );
}
