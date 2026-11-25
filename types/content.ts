// The shape of everything the site shows. The CMS will read and write these same shapes,
// so pages never need to change when content moves from these files to the database.

export type ProjectStatus = "live" | "not-shipped" | "handed-off";

export type DiaryStage = "overview" | "challenge" | "approach" | "outcome" | "reflection";

export interface DiaryEntry {
  stage: DiaryStage;
  /** Heading shown above the entry, e.g. "Context & challenge" */
  label: string;
  /** The diary date line, e.g. "Dear diary, March 2026" */
  date: string;
  body: string;
}

export interface Screenshot {
  label: string;
  /** Image path or URL. Empty until real screenshots are uploaded. */
  src?: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Short type, e.g. "Healthcare workforce platform" */
  kind: string;
  /** Longer category line, e.g. "Healthcare SaaS · UI/UX design" */
  category: string;
  /** Category-bar filters this project shows under */
  tags: string[];
  /** Stamp ids this project earns (see content/stamps.ts) */
  stamps: string[];
  /** Year the project started, used for stamp dates and sorting */
  year: number;
  /** Display range, e.g. "Mar–Jul 2026" */
  years: string;
  roleShort: string;
  role: string;
  platform: string;
  status: ProjectStatus;
  liveUrl?: string;
  /** Clickable prototype of work that never shipped. Shown as a preview, never as a live site. */
  previewUrl?: string;
  /** Second prototype link, e.g. the mobile app when previewUrl is the web dashboard. */
  previewMobileUrl?: string;
  /** Under NDA: visitors need a password (set in Studio) to see anything past the title. */
  locked?: boolean;
  docsUrl?: string;
  designSystemUrl?: string;
  screenshots: Screenshot[];
  facts: { label: string; value: string }[];
  stats: { value: string; label: string }[];
  entries: DiaryEntry[];
}

export interface StampDef {
  id: string;
  /** The "place", e.g. "Healthcare" */
  label: string;
  /** Small line around the stamp edge */
  motto: string;
  shape: "circle" | "rect";
}

export interface EarnedStamp extends StampDef {
  earned: true;
  /** Year of the first project in this area */
  year: number;
  projects: { slug: string; name: string }[];
}

export interface OpenStamp extends StampDef {
  earned: false;
}

export type PassportStamp = EarnedStamp | OpenStamp;

export interface Bundle {
  name: string;
  payInFull: { usd: string; php: string };
  installments: { usd: string; php: string };
  save?: string;
  popular?: boolean;
  items: string[];
}

export interface SiteContent {
  name: string;
  role: string;
  location: string;
  email: string;
  replyTime: string;
  tagline: string;
  calendlyUrl: string;
  resumeUrl?: string;
  enterprise: { label: string; url: string };
  socials: { label: string; url: string }[];
  heroLine: string;
  hostTeaser: string;
  story: string[];
  karinderya: string;
  interests: string[];
  houseRules: { title: string; body: string }[];
  tools: { group: string; items: string[] }[];
  inTheWorks: string;
  testimonials: { name: string; title: string; year: string; quote: string }[];
  gallery: { title: string; date: string; category?: "web" | "mobile"; src?: string }[];
  business: {
    intro: string;
    bundles: Bundle[];
    businessBundles: string[];
    addons: { name: string; usd: string; php: string; description: string }[];
    process: { title: string; body: string }[];
    faqs: { q: string; a: string }[];
    paymentOptions: string[];
    timelines: string[];
  };
}
