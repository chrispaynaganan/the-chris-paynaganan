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

export const businessBoard: BoardSpec = {
  board: "business",
  title: "Business",
  description: "Everything on Chris for Business: bundles and prices, add-ons, the process and the FAQ.",
  groups: [
    {
      key: "settings",
      label: "Page settings",
      color: "dark",
      single: true,
      itemLabel: "Setting",
      fields: [
        { type: "textarea", key: "intro", label: "Intro under the headline", rows: 4 },
        { type: "lines", key: "paymentOptions", label: "Payment options (project form)" },
        { type: "lines", key: "timelines", label: "Timelines (project form)" },
      ],
      summary: (_t, d) => clip(d.intro),
    },
    {
      key: "bundles",
      label: "Bundles",
      color: "green",
      itemLabel: "Bundle",
      fields: [
        { type: "text", key: "payInFull.usd", label: "Pay in full · USD", placeholder: "$990" },
        { type: "text", key: "payInFull.php", label: "Pay in full · PHP", placeholder: "₱62,400" },
        { type: "text", key: "installments.usd", label: "Installments · USD (from)", placeholder: "$1,270" },
        { type: "text", key: "installments.php", label: "Installments · PHP (from)", placeholder: "₱80,000" },
        { type: "text", key: "save", label: "Savings badge", placeholder: "Save $645", hint: "Leave empty for no badge." },
        { type: "toggle", key: "popular", label: "Most chosen", hint: "Shows this one as the white, highlighted card." },
        { type: "lines", key: "items", label: "What’s included" },
      ],
      summary: (_t, d) => `${s((d.payInFull as Record<string, unknown>)?.usd) || "No price"} · ${count(d.items, "inclusion")}`,
      defaults: { payInFull: { usd: "", php: "" }, installments: { usd: "", php: "" }, save: "", popular: false, items: [] },
    },
    {
      key: "business-bundles",
      label: "Business bundles",
      color: "blue",
      itemLabel: "Bundle",
      fields: [],
      summary: () => "Listed under “For companies” and in the project form",
    },
    {
      key: "addons",
      label: "Add-ons",
      color: "purple",
      itemLabel: "Add-on",
      fields: [
        { type: "text", key: "usd", label: "Price · USD", placeholder: "$150" },
        { type: "text", key: "php", label: "Price · PHP", placeholder: "₱9,450" },
        { type: "textarea", key: "description", label: "Description", rows: 2 },
      ],
      summary: (_t, d) => `${s(d.usd)} · ${clip(d.description, 60)}`,
      defaults: { usd: "", php: "", description: "" },
    },
    {
      key: "process",
      label: "How a project goes",
      color: "orange",
      itemLabel: "Step",
      fields: [{ type: "textarea", key: "body", label: "Short description", rows: 2 }],
      summary: (_t, d) => clip(d.body),
      defaults: { body: "" },
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
