import type { PassportStamp } from "@/types/content";
import { Passport } from "./Passport";

export function PassportSection({ stamps, id = "passport" }: { stamps: PassportStamp[]; id?: string }) {
  const earned = stamps.filter((s) => s.earned).length;
  const open = stamps.length - earned;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">My design passport</h2>
          <p className="max-w-xl text-lg text-body">
            A stamp for every area I’ve designed or built in. The dashed ones are where I’d like to go next.
          </p>
        </div>
        <span className="text-sm font-medium">
          {earned} stamps · {open} open
        </span>
      </div>
      <Passport stamps={stamps} />
    </section>
  );
}
