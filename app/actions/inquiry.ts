"use server";

import { Resend } from "resend";
import { adminClient } from "@/lib/supabase/server";

export type InquiryInput =
  | {
      source: "project";
      name: string;
      email: string;
      company?: string;
      tier: string;
      payment: string;
      timeline: string;
      details?: string;
      businessBundles: string[];
    }
  | {
      source: "contact";
      name: string;
      email: string;
      company?: string;
      reason: string;
      message: string;
    };

export type InquiryResult = { ok: true } | { ok: false; reason: "not-configured" | "invalid" | "failed" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: string | undefined, max: number) => (v ?? "").trim().slice(0, max);

/** Saves a form message to the Inquiries board, then (if set up) emails Chris about it. */
export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  const name = clip(input.name, 120);
  const email = clip(input.email, 200);
  if (!name || !EMAIL.test(email)) return { ok: false, reason: "invalid" };

  const db = adminClient();
  if (!db) return { ok: false, reason: "not-configured" };

  const row: Record<string, string | null> =
    input.source === "project"
      ? {
          source: "project",
          full_name: name,
          email,
          company: clip(input.company, 200) || null,
          bundle_category: input.businessBundles.includes(input.tier) ? "business" : "professional",
          bundle_tier: clip(input.tier, 120),
          payment_option: clip(input.payment, 120),
          timeline: clip(input.timeline, 120),
          project_details: clip(input.details, 5000) || null,
          currency: "usd",
        }
      : {
          source: "contact",
          full_name: name,
          email,
          company: clip(input.company, 200) || null,
          reason: clip(input.reason, 120),
          message: clip(input.message, 5000),
        };

  if (input.source === "project" && (!row.bundle_tier || !row.payment_option || !row.timeline)) return { ok: false, reason: "invalid" };
  if (input.source === "contact" && (!row.reason || !row.message)) return { ok: false, reason: "invalid" };

  const { error } = await db.from("inquiries").insert(row);
  if (error) return { ok: false, reason: "failed" };

  // Heads-up email. Optional: a failure here never loses the inquiry, it's already saved.
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (key && to && from) {
    try {
      const subject = input.source === "project" ? `New project inquiry: ${row.bundle_tier} from ${name}` : `New message (${row.reason}) from ${name}`;
      const body = Object.entries(row)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      await new Resend(key).emails.send({ from, to, replyTo: email, subject, text: `${body}\n\nOpen Studio → Inquiries to reply and track it.` });
    } catch {
      // ignore
    }
  }
  return { ok: true };
}
