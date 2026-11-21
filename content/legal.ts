// Privacy policy and terms, written from how this site actually works.
// Not legal advice: have them reviewed before relying on them.

export type LegalDoc = { title: string; updated: string; intro: string; sections: { heading: string; body: string[] }[] };

export const privacy: LegalDoc = {
  title: "Privacy policy",
  updated: "November 20, 2026",
  intro:
    "This site is run by Chris Paynaganan, a product and experience designer based in Lipa City, Batangas, Philippines. This page explains what happens to your information when you visit it or get in touch.",
  sections: [
    {
      heading: "What this site collects",
      body: [
        "The site doesn’t ask you to sign up, doesn’t store anything in your browser, and doesn’t use advertising or analytics cookies.",
      ],
    },
    {
      heading: "When you contact me",
      body: [
        "When you send the contact or project form, what you wrote (your name, email address, company and message, plus the bundle, payment option and timeline on the project form) is saved in my private database and emailed to me.",
        "I use it only to reply to you and, if we work together, to run the project.",
        "I don’t sell, rent or share your details with anyone for marketing.",
      ],
    },
    {
      heading: "Other services",
      body: [
        "The site is hosted on Vercel, which may keep standard server logs (such as IP address and browser type) to run and secure the service. Form messages are stored with Supabase and the notification email is sent through Resend.",
        "Booking a call uses Calendly, and the LinkedIn, Facebook, Instagram and share links open those services. Each has its own privacy policy, which applies once you’re on their site.",
      ],
    },
    {
      heading: "How long I keep it",
      body: ["Messages are kept for as long as our conversation or project needs them, and as long as records must be kept for invoicing. Ask and I’ll delete yours."],
    },
    {
      heading: "Your rights",
      body: [
        "Under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), you can ask to see, correct or delete the personal information I hold about you.",
        "Email me at mark.payns@gmail.com and I’ll take care of it.",
      ],
    },
    {
      heading: "Changes",
      body: ["If this policy changes, the date at the top of this page will change with it."],
    },
  ],
};

export const terms: LegalDoc = {
  title: "Terms and conditions",
  updated: "November 20, 2026",
  intro:
    "These terms cover using this website and, for clients of Chris for Business, how projects work. If we sign a project agreement, that agreement takes priority over this page.",
  sections: [
    {
      heading: "Using this site",
      body: [
        "Everything here, including the designs, case studies, writing and images, belongs to Chris Paynaganan or to the clients it was made for. You’re welcome to browse and share links to it, but please don’t copy or reuse the work without permission.",
        "Project write-ups describe real work. Some client details are left out or simplified.",
      ],
    },
    {
      heading: "Starting a project",
      body: [
        "Projects follow the same steps every time: you reach out, fill in the intake form, we have a discovery call, and you receive a quotation for the bundle and scope we agree on.",
        "Work officially starts once the agreement is signed and payment is received.",
      ],
    },
    {
      heading: "Prices and payment",
      body: [
        "Prices are set in US dollars. Philippine peso amounts are estimates and can shift with the exchange rate.",
        "You can pay in full, in 3 monthly payments, or as a 50/50 split. Installment prices are higher than paying in full.",
        "Rush timelines cost more and can affect quality. I’ll always say so before we agree on one.",
      ],
    },
    {
      heading: "Revisions and changes",
      body: [
        "Each bundle includes a set number of revision rounds. Minor feedback isn’t counted as a revision.",
        "Extra revision rounds are a flat fee per round, and I’ll flag this before any work on them starts.",
        "Switching bundles is usually possible, especially early on. Scope and price are adjusted to match, and it gets harder once development has started.",
      ],
    },
    {
      heading: "After launch",
      body: [
        "Each bundle includes post-project support for a set period. After it ends, you keep your files, CRM and documentation.",
        "Later fixes can be handled one at a time, or covered by monthly maintenance.",
      ],
    },
    {
      heading: "Links to other sites",
      body: ["Links to other websites, including Oh, Yvi!, are provided for convenience. Those sites have their own terms."],
    },
    {
      heading: "Limits",
      body: [
        "The site is provided as it is. I work to keep it accurate and available, but can’t guarantee it will always be either.",
        "These terms are governed by the laws of the Philippines.",
      ],
    },
    {
      heading: "Questions",
      body: ["Email me at mark.payns@gmail.com."],
    },
  ],
};
