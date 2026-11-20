import type { SiteContent } from "@/types/content";

export const site: SiteContent = {
  name: "Chris Paynaganan",
  role: "Product & Experience Designer",
  location: "Lipa City, Batangas, Philippines",
  email: "mark.payns@gmail.com",
  replyTime: "Replies personally, usually within a day or two",
  tagline: "I build websites that make you money.",
  calendlyUrl: "https://calendly.com/uxbychrisph/the-virtual-coffee",
  resumeUrl: "https://buxyunximvrtzhmwvdnp.supabase.co/storage/v1/object/public/site-assets/about-hero-resume-354a595e-a5f8-463a-8ccf-ffbaeeb7ca37.pdf",
  enterprise: { label: "Chris Enterprise", url: "https://www.ohyvi.com" },
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/chrispaynaganan/" },
    { label: "Facebook", url: "https://www.facebook.com/chrispaynaganan" },
    { label: "Instagram", url: "https://www.instagram.com/uxbychrisph/" },
  ],
  heroLine: "Product & Experience Designer, based in Batangas.",
  hostTeaser:
    "I started as a graphic artist, joined the military for steady income, and found my way back to design through a developer bootcamp. These days I design and build, mostly solo.",
  story: [
    "Dear diary. I started out as a graphic artist, then joined the military for steady income. When I’d saved enough to go back to design, the pandemic hit, so I took call center shifts, taught ESL and did virtual assistant work. A developer bootcamp pulled me back in, and that’s where I fell for interface design and for being genuinely useful to people. My first design job came with early work I still think of as imperfect but meaningful.",
    "I began on a team handling documentation, user research and design. Now I lead solo projects across healthcare, fitness, accounting and, lately, voice acting. I even see a little military discipline in how I run UX research.",
  ],
  karinderya:
    "I love food with a story behind it, and I’m drawn to karinderyas. They serve it fresh, they know their regulars, and they adapt to the street they’re on. Design works the same way: two products can solve the same problem and still look completely different, because they’re shaped by who they serve.",
  interests: ["Cooking recipe videos", "Karinderyas", "K-dramas", "Popcorn & fries", "Coffee", "Travel for local food"],
  houseRules: [
    { title: "Quick, clear replies", body: "Fast but thoughtful, always with a next step. No long silences." },
    { title: "Honest scope", body: "Minor feedback is not a revision, and I don’t pad scope." },
    { title: "Real people over AI guesses", body: "I talk to people in the industry, and re-validate research for every client." },
    { title: "Timelines from deliverables", body: "Rushing costs more and can cost quality. I’ll tell you up front." },
  ],
  tools: [
    { group: "Design", items: ["Figma", "Photoshop", "Illustrator"] },
    { group: "Build", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Resend", "Vercel", "GitHub", "VS Code"] },
    { group: "Grow", items: ["SEMrush (technical SEO)"] },
  ],
  inTheWorks: "In the works: AI automation, like custom chatbots for client sites. Not offered yet.",
  testimonials: [
    {
      name: "Erwin Natividad",
      title: "Founder, Resonate with Erwin",
      year: "2026",
      quote: "[Paste Erwin’s exact quote here.]",
    },
  ],
  gallery: [{ title: "WPH Digital Design Concept", date: "March 2024" }],
  business: {
    intro:
      "Clean, thoughtful design that fits how people actually browse, so visitors stay and act instead of leaving in seconds. Direct communication the whole way: no long silences, no Loom videos instead of updates.",
    bundles: [
      {
        name: "The Starting Point",
        payInFull: { usd: "$990", php: "₱62,400" },
        installments: { usd: "$1,270", php: "₱80,000" },
        items: ["Project documentation and manual", "Built-in CRM", "Figma design file with design system", "Up to 5 pages + utility pages", "2 revision rounds", "2 weeks of post-project support"],
      },
      {
        name: "The Most Popular One",
        payInFull: { usd: "$1,585", php: "₱99,900" },
        installments: { usd: "$2,230", php: "₱140,500" },
        save: "Save $645",
        popular: true,
        items: ["Everything in The Starting Point", "Basic personal branding and positioning", "Video walkthroughs for troubleshooting", "Up to 8 pages + utility pages", "4 revision rounds", "1 month of post-project support", "Hard-coded development", "Hosting setup"],
      },
      {
        name: "The Established Presence",
        payInFull: { usd: "$2,290", php: "₱144,300" },
        installments: { usd: "$3,105", php: "₱195,600" },
        save: "Save $815",
        items: ["Everything in The Most Popular One", "Full personal branding, positioning and strategy", "Up to 10 pages + utility pages", "6 revision rounds", "2 months of post-project support", "Basic technical SEO (SEMrush)"],
      },
    ],
    businessBundles: ["The Foundation", "The Alignment", "The Mandate"],
    addons: [
      { name: "Domain purchase", usd: "$20", php: "₱1,260", description: "Varies by TLD and registrar" },
      { name: "Business email setup", usd: "$30", php: "₱1,890", description: "Setup fee. The subscription is billed separately." },
      { name: "Logo design", usd: "$150", php: "₱9,450", description: "A standalone mark for brands without a full identity" },
      { name: "Social media graphics", usd: "$80", php: "₱5,040", description: "Post templates for your main platforms" },
      { name: "Custom graphics", usd: "$60", php: "₱3,780", description: "One-off illustrations or icons for a page or feature" },
      { name: "Content strategy", usd: "$180", php: "₱11,300", description: "What to say and where, based on your goals" },
      { name: "Copywriting pass", usd: "$140", php: "₱8,820", description: "Your existing copy, rewritten to fit your voice and goals" },
      { name: "Monthly maintenance", usd: "$50/mo", php: "₱3,150/mo", description: "Updates, backups and small fixes after launch" },
    ],
    process: [
      { title: "Reach out", body: "Instagram, email or the form below." },
      { title: "Intake form", body: "An instant email with the form and a call scheduler." },
      { title: "Discovery call", body: "Your needs, goals and where things stand." },
      { title: "Quotation", body: "For the bundle and scope we agree on." },
      { title: "Agreement & invoice", body: "Work starts once payment is in." },
      { title: "Delivery & support", body: "Support by tier, then final files are yours." },
    ],
    faqs: [
      { q: "What if I need more revisions than my tier includes?", a: "Extra rounds are a flat fee per round, and I’ll flag it before any work on them starts." },
      { q: "Can I switch bundles mid-project?", a: "Usually, yes, especially early on. Moving up or down a tier adjusts scope and price. It gets harder once development starts, so raise it early." },
      { q: "What happens after my support window ends?", a: "You keep the files, the CRM and the documentation. Later issues can be one-off fixes, or you can add monthly maintenance." },
      { q: "Do I need to know which bundle I want before reaching out?", a: "No. Most people start with a rough idea, and we settle the right tier together once the project is clearer." },
      { q: "Is the “valued at” price real?", a: "Yes. Each item is priced at what it would cost on its own, so the savings reflect actual figures." },
    ],
    paymentOptions: ["Pay in Full", "3 Monthly Payments", "50/50 Split"],
    timelines: ["ASAP", "Within 1 month", "1–3 months", "Flexible / no rush"],
  },
};
