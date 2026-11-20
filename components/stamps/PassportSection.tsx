import { getProjects, getSite } from "@/lib/content";
import type { PassportStamp } from "@/types/content";
import { PassportBook } from "./PassportBook";

export async function PassportSection({ stamps, id = "passport" }: { stamps: PassportStamp[]; id?: string }) {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const earned = stamps.filter((s) => s.earned).length;
  const open = stamps.length - earned;
  const holder = {
    name: site.name,
    role: site.role,
    location: site.location.split(",").slice(0, 2).join(","),
    since: Math.min(...projects.map((p) => p.year)),
  };
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-28 flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight">
            My design passport
          </h2>
          <p className="max-w-xl text-lg text-body">
            A stamp for every area I’ve designed or built in. The dashed ones are where I’d like to go next.
          </p>
        </div>
        <span className="text-sm font-medium">
          {earned} stamps · {open} open
        </span>
      </div>
      <PassportBook stamps={stamps} holder={holder} />
    </section>
  );
}
