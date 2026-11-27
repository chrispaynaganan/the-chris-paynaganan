"use server";

import { Resend } from "resend";
import { adminClient } from "@/lib/supabase/server";

export type InquiryInput =
  | {
      source: "project";
      name: string;
      email: string;
      company: string;
      role?: string;
      website?: string;
      problem: string;
      success?: string;
      budget: string;
      tier: string;
      timeline: string;
      heard?: string;
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
          bundle_category: input.businessBundles.includes(input.tier) ? "business" : input.tier === "Help me choose" ? null : "professional",
          bundle_tier: clip(input.tier, 120),
          // The form asks for a budget range now; payment is settled in the proposal
          payment_option: clip(input.budget, 120),
          timeline: clip(input.timeline, 120),
          project_details: clip(
            [
              `What's not working: ${input.problem.trim()}`,
              input.success?.trim() && `Success in 6 months: ${input.success.trim()}`,
              `Budget: ${input.budget}`,
              input.role?.trim() && `Role: ${input.role.trim()}`,
              input.website?.trim() && `Website: ${input.website.trim()}`,
              input.heard?.trim() && `Heard about me: ${input.heard.trim()}`,
            ]
              .filter(Boolean)
              .join("\n"),
            5000,
          ),
          currency: "php",
        }
      : {
          source: "contact",
          full_name: name,
          email,
          company: clip(input.company, 200) || null,
          reason: clip(input.reason, 120),
          message: clip(input.message, 5000),
        };

  if (input.source === "project" && (!row.company || !input.problem.trim() || !row.payment_option || !row.timeline)) return { ok: false, reason: "invalid" };
  if (input.source === "contact" && (!row.reason || !row.message)) return { ok: false, reason: "invalid" };

  const { error } = await db.from("inquiries").insert(row);
  if (error) return { ok: false, reason: "failed" };

  // Heads-up email. Optional: a failure here never loses the inquiry, it's already saved.
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (key && to && from) {
    try {
      const subject = input.source === "project" ? `New project inquiry from ${name} (${row.company}): ${row.bundle_tier}` : `New message (${row.reason}) from ${name}`;
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
