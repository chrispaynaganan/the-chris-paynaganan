// The Business board's Studio rows, built from content/site.ts.
// Shared by generate-seed.mts (first setup) and generate-business-sql.mts (content updates).
import type { SiteContent, Bundle } from "../types/content.ts";

export type BusinessItem = { group: string; title: string; data: unknown };

const bundleData = (x: Bundle) => ({
  bestFor: x.bestFor ?? "",
  payInFull: x.payInFull,
  installments: x.installments,
  timeline: x.timeline ?? "",
  valuedAt: x.valuedAt ?? "",
  save: x.save ?? "",
  popular: !!x.popular,
  lead: x.lead ?? "",
  items: x.items,
  // Studio edits these as lines, like "Design | ₱57,525"
  breakdown: (x.breakdown ?? []).map((p) => `${p.phase} | ${p.php}`),
});

export function businessItems(b: SiteContent["business"]): BusinessItem[] {
  const out: BusinessItem[] = [];
  const add = (group: string, title: string, data: unknown = {}) => out.push({ group, title, data });
  add("settings", "Business settings", {
    intro: b.intro,
    notes: b.notes,
    callOutcome: b.callOutcome,
    paymentOptions: b.paymentOptions,
    budgets: b.budgets,
    timelines: b.timelines,
  });
  b.companyBundles.forEach((x) => add("company-bundles", x.name, bundleData(x)));
  b.bundles.forEach((x) => add("bundles", x.name, bundleData(x)));
  b.addons.forEach((a) => add("addons", a.name, { group: a.group ?? "all", usd: a.usd, php: a.php, description: a.description }));
  b.process.forEach((p) => add("process", p.title, { when: p.when ?? "", body: p.body, you: p.you ?? "", get: p.get ?? "" }));
  b.whyMe.forEach((w) => add("why-me", w.title, { body: w.body }));
  b.fit.good.forEach((t) => add("fit-good", t));
  b.fit.not.forEach((t) => add("fit-not", t));
  b.guarantees.forEach((g) => add("guarantees", g.title, { body: g.body }));
  b.caseStudies.forEach((c) => add("case-studies", c.name, { industry: c.industry, problem: c.problem, built: c.built, href: c.href ?? "" }));
  b.callAgenda.forEach((a) => add("call-agenda", a.title, { minutes: a.minutes }));
  b.faqs.forEach((f) => add("faq", f.q, { a: f.a }));
  return out;
}
