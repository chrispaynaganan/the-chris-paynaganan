import type { StudioColor } from "./colors";

/** What a field in an item's side panel edits. `key` is a path into the item's data, like "payInFull.usd". */
export type FieldSpec =
  | { type: "text" | "url" | "email"; key: string; label: string; hint?: string; placeholder?: string }
  | { type: "textarea"; key: string; label: string; hint?: string; rows?: number }
  | { type: "lines"; key: string; label: string; hint?: string }
  | { type: "toggle"; key: string; label: string; hint?: string }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { type: "image"; key: string; label: string; hint?: string }
  | { type: "sections"; key: string; label: string };

export type GroupSpec = {
  key: string;
  label: string;
  color: StudioColor;
  /** One fixed item (settings), no adding */
  single?: boolean;
  itemLabel: string;
  fields: FieldSpec[];
  summary: (title: string, data: Record<string, unknown>) => string;
  defaults?: Record<string, unknown>;
};

export type BoardSpec = { board: "business" | "site"; title: string; description: string; groups: GroupSpec[] };

const s = (v: unknown) => (typeof v === "string" ? v : "");
const clip = (v: unknown, n = 80) => {
  const t = s(v).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};
const count = (v: unknown, word: string) => {
  const n = Array.isArray(v) ? v.length : 0;
  return `${n} ${word}${n === 1 ? "" : "s"}`;
};

const bundleFields: FieldSpec[] = [
  { type: "text", key: "bestFor", label: "Best for", placeholder: "Businesses that need a credible, working website now." },
  { type: "text", key: "payInFull.php", label: "Price · PHP", placeholder: "₱136,000" },
  { type: "text", key: "payInFull.usd", label: "Price · USD (approximate)", placeholder: "≈ $2,160" },
  { type: "text", key: "timeline", label: "Timeline", placeholder: "About 5 weeks" },
  { type: "text", key: "valuedAt", label: "Valued at", placeholder: "₱144,845", hint: "The sum of its parts, shown crossed out." },
  { type: "text", key: "save", label: "Savings badge", placeholder: "Save ₱8,845", hint: "Leave empty for no badge." },
  { type: "toggle", key: "popular", label: "Recommended", hint: "Shows this one as the white, highlighted card." },
  { type: "text", key: "lead", label: "Line above the inclusions", placeholder: "Everything in The Foundation, plus:" },
  { type: "lines", key: "items", label: "What’s included" },
  { type: "lines", key: "breakdown", label: "Value by phase", hint: "One per line, like: Design | ₱57,525. Feeds the “What’s inside” table." },
];
const bundleSummary = (_t: string, d: Record<string, unknown>) =>
  `${s((d.payInFull as Record<string, unknown>)?.php) || "No price"} · ${s(d.timeline) || "No timeline"} · ${count(d.items, "inclusion")}`;
const bundleDefaults = { payInFull: { usd: "", php: "" }, installments: { usd: "", php: "" }, bestFor: "", timeline: "", valuedAt: "", save: "", popular: false, lead: "", items: [], breakdown: [] };

export const businessBoard: BoardSpec = {
  board: "business",
  title: "Business",
  description: "Everything on Chris for Business: bundles and prices, add-ons, the process, guarantees, case studies and the FAQ.",
  groups: [
    {
      key: "settings",
      label: "Page settings",
      color: "dark",
      single: true,
      itemLabel: "Setting",
      fields: [
        { type: "textarea", key: "intro", label: "Intro under the headline", rows: 4 },
        { type: "textarea", key: "notes.business", label: "Note under the business bundles", rows: 2 },
        { type: "textarea", key: "notes.personal", label: "Note under the personal bundles", rows: 2 },
        { type: "textarea", key: "callOutcome", label: "What people leave the discovery call with", rows: 2 },
        { type: "lines", key: "budgets", label: "Budget ranges (project form)" },
        { type: "lines", key: "timelines", label: "Timelines (project form)" },
      ],
      summary: (_t, d) => clip(d.intro),
    },
    {
      key: "company-bundles",
      label: "Business bundles",
      color: "blue",
      itemLabel: "Bundle",
      fields: bundleFields,
      summary: bundleSummary,
      defaults: bundleDefaults,
    },
    {
      key: "bundles",
      label: "Personal bundles",
      color: "green",
      itemLabel: "Bundle",
      fields: bundleFields,
      summary: bundleSummary,
      defaults: bundleDefaults,
    },
    {
      key: "addons",
      label: "Add-ons",
      color: "purple",
      itemLabel: "Add-on",
      fields: [
        {
          type: "select",
          key: "group",
          label: "Shown for",
          options: [
            { value: "business", label: "Business" },
            { value: "personal", label: "Personal" },
            { value: "all", label: "Everyone" },
          ],
        },
        { type: "text", key: "php", label: "Price · PHP", placeholder: "₱9,450" },
        { type: "text", key: "usd", label: "Price · USD (approximate)", placeholder: "≈ $150" },
        { type: "textarea", key: "description", label: "Description", rows: 2 },
      ],
      summary: (_t, d) => `${s(d.group) || "all"} · ${s(d.php)} · ${clip(d.description, 60)}`,
      defaults: { group: "all", usd: "", php: "", description: "" },
    },
    {
      key: "process",
      label: "How a project goes",
      color: "orange",
      itemLabel: "Step",
      fields: [
        { type: "text", key: "when", label: "When", placeholder: "Weeks 2–3" },
        { type: "textarea", key: "body", label: "What I do", rows: 2 },
        { type: "text", key: "you", label: "What you do" },
        { type: "text", key: "get", label: "What you get" },
      ],
      summary: (_t, d) => `${s(d.when)} · ${clip(d.body, 60)}`,
      defaults: { when: "", body: "", you: "", get: "" },
    },
    {
      key: "why-me",
      label: "Why me",
      color: "dark",
      itemLabel: "Reason",
      fields: [{ type: "textarea", key: "body", label: "Text", rows: 3 }],
      summary: (_t, d) => clip(d.body),
      defaults: { body: "" },
    },
    {
      key: "fit-good",
      label: "A good fit if you’re…",
      color: "green",
      itemLabel: "Line",
      fields: [],
      summary: () => "Shown in “Who it’s for”",
    },
    {
      key: "fit-not",
      label: "Probably not a fit if you…",
      color: "red",
      itemLabel: "Line",
      fields: [],
      summary: () => "Shown in “Who it’s for”",
    },
    {
      key: "guarantees",
      label: "Guarantees",
      color: "blue",
      itemLabel: "Guarantee",
      fields: [{ type: "textarea", key: "body", label: "Text", rows: 3 }],
      summary: (_t, d) => clip(d.body),
      defaults: { body: "" },
    },
    {
      key: "case-studies",
      label: "Case studies",
      color: "purple",
      itemLabel: "Case study",
      fields: [
        { type: "text", key: "industry", label: "Industry" },
        { type: "textarea", key: "problem", label: "The problem", rows: 2 },
        { type: "textarea", key: "built", label: "What I built", rows: 3 },
        { type: "text", key: "href", label: "Link to the full story", placeholder: "/projects/resonate" },
      ],
      summary: (_t, d) => `${s(d.industry)} · ${clip(d.problem, 60)}`,
      defaults: { industry: "", problem: "", built: "", href: "" },
    },
    {
      key: "call-agenda",
      label: "Discovery call agenda",
      color: "grey",
      itemLabel: "Agenda item",
      fields: [{ type: "text", key: "minutes", label: "Length", placeholder: "10 min" }],
      summary: (_t, d) => s(d.minutes),
      defaults: { minutes: "" },
    },
    {
      key: "faq",
      label: "FAQ",
      color: "lime",
      itemLabel: "Question",
      fields: [{ type: "textarea", key: "a", label: "Answer", rows: 4 }],
      summary: (_t, d) => clip(d.a),
      defaults: { a: "" },
    },
  ],
};

export const siteBoard: BoardSpec = {
  board: "site",
  title: "Site & About",
  description: "Your profile, story, tools, testimonials, gallery, niches and legal pages.",
  groups: [
    {
      key: "profile",
      label: "Profile",
      color: "dark",
      single: true,
      itemLabel: "Setting",
      fields: [
        { type: "text", key: "name", label: "Name" },
        { type: "text", key: "role", label: "Role" },
        { type: "text", key: "heroLine", label: "Home headline" },
        { type: "textarea", key: "hostTeaser", label: "“Meet your host” on the home page", rows: 3 },
        { type: "text", key: "tagline", label: "Business tagline" },
        { type: "text", key: "location", label: "Location" },
        { type: "email", key: "email", label: "Contact email" },
        { type: "text", key: "replyTime", label: "Reply time" },
        { type: "url", key: "calendlyUrl", label: "Calendly link" },
        { type: "url", key: "resumeUrl", label: "Résumé link", hint: "Leave empty to hide the Résumé links." },
        { type: "textarea", key: "inTheWorks", label: "“In the works” note on About", rows: 2 },
        { type: "text", key: "enterprise.label", label: "Footer enterprise label" },
        { type: "url", key: "enterprise.url", label: "Footer enterprise link" },
      ],
      summary: (_t, d) => `${s(d.name)} · ${s(d.role)}`,
    },
    {
      key: "story",
      label: "About: my story",
      color: "purple",
      itemLabel: "Paragraph",
      fields: [{ type: "textarea", key: "body", label: "Paragraph", rows: 6 }],
      summary: (_t, d) => clip(d.body),
      defaults: { body: "" },
    },
    {
      key: "karinderya",
      label: "About: karinderya",
      color: "orange",
      single: true,
      itemLabel: "Paragraph",
      fields: [{ type: "textarea", key: "body", label: "Paragraph", rows: 6 }],
      summary: (_t, d) => clip(d.body),
    },
    { key: "interests", label: "About: interests", color: "lime", itemLabel: "Interest", fields: [], summary: () => "Chip on the About page" },
    {
      key: "house-rules",
      label: "About: house rules",
      color: "blue",
      itemLabel: "Rule",
      fields: [{ type: "textarea", key: "body", label: "Description", rows: 2 }],
      summary: (_t, d) => clip(d.body),
      defaults: { body: "" },
    },
    {
      key: "tools",
      label: "Toolbox",
      color: "green",
      itemLabel: "Group",
      fields: [{ type: "lines", key: "items", label: "Tools" }],
      summary: (_t, d) => (Array.isArray(d.items) ? d.items.join(", ") : ""),
      defaults: { items: [] },
    },
    {
      key: "testimonials",
      label: "Testimonials",
      color: "purple",
      itemLabel: "Testimonial",
      fields: [
        { type: "text", key: "title", label: "Their role and company" },
        { type: "text", key: "year", label: "Year" },
        { type: "textarea", key: "quote", label: "Quote, word for word", rows: 4 },
      ],
      summary: (_t, d) => clip(d.quote),
      defaults: { title: "", year: "", quote: "" },
    },
    {
      key: "socials",
      label: "Social links",
      color: "blue",
      itemLabel: "Link",
      fields: [{ type: "url", key: "url", label: "Link" }],
      summary: (_t, d) => s(d.url),
      defaults: { url: "" },
    },
    {
      key: "gallery",
      label: "Gallery",
      color: "orange",
      itemLabel: "Piece",
      fields: [
        { type: "image", key: "src", label: "Image" },
        { type: "text", key: "date", label: "Date", placeholder: "March 2024" },
        {
          type: "select",
          key: "category",
          label: "Category",
          options: [
            { value: "", label: "None" },
            { value: "web", label: "Web Designs" },
            { value: "mobile", label: "Mobile App Designs" },
          ],
        },
      ],
      summary: (_t, d) => s(d.date),
      defaults: { date: "", category: "", src: "" },
    },
    {
      key: "niches",
      label: "Niches (stamps)",
      color: "green",
      itemLabel: "Niche",
      fields: [
        { type: "text", key: "id", label: "Short id", hint: "Lowercase, like “fitness”. Projects earn this stamp by picking it." },
        { type: "text", key: "motto", label: "Line around the stamp" },
        {
          type: "select",
          key: "shape",
          label: "Stamp shape",
          options: [
            { value: "circle", label: "Circle" },
            { value: "rect", label: "Rectangle" },
          ],
        },
      ],
      summary: (_t, d) => s(d.motto),
      defaults: { id: "", motto: "", shape: "circle" },
    },
    {
      key: "legal",
      label: "Legal pages",
      color: "grey",
      itemLabel: "Page",
      fields: [
        { type: "text", key: "updated", label: "Last updated" },
        { type: "textarea", key: "intro", label: "Intro", rows: 3 },
        { type: "sections", key: "sections", label: "Sections" },
      ],
      summary: (_t, d) => `Updated ${s(d.updated)} · ${count(d.sections, "section")}`,
    },
  ],
};

export function getPath(data: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), data);
}

export function setPath(data: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...data, [head]: value };
  const child = (data[head] && typeof data[head] === "object" ? data[head] : {}) as Record<string, unknown>;
  return { ...data, [head]: setPath(child, rest.join("."), value) };
}
