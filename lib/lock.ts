// Password protection for NDA projects (see supabase/0009_project_lock.sql).
// Server only: reads the visitor's unlock cookie and checks it against Supabase.
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { isOwner, publicClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

/** Cookie that remembers a visitor unlocked a project (30 days, or until the password changes). */
export const lockCookie = (slug: string) => `nda-${slug}`;
export const LOCK_MAX_AGE = 60 * 60 * 24 * 30;

// Only used when Supabase isn't set up (local work from the content files).
const FALLBACK_PASSWORD = process.env.NDA_FALLBACK_PASSWORD ?? "cishifts";
const fallbackToken = (slug: string) => createHash("sha256").update(`${slug}:${FALLBACK_PASSWORD}`).digest("hex");

/** Right password → token to store in the cookie. Wrong password → null. */
export async function unlockToken(slug: string, password: string): Promise<string | null> {
  if (!supabaseConfigured) return password === FALLBACK_PASSWORD ? fallbackToken(slug) : null;
  const { data, error } = await publicClient().rpc("studio_unlock_project", { p_slug: slug, p_password: password });
  return !error && typeof data === "string" && data ? data : null;
}

async function tokenValid(slug: string, token: string) {
  if (!supabaseConfigured) return token === fallbackToken(slug);
  const { data, error } = await publicClient().rpc("studio_check_project_token", { p_slug: slug, p_token: token });
  return !error && data === true;
}

/** True when this request may see a locked project: the right cookie, or you signed in to Studio. */
export async function isUnlocked(slug: string) {
  const token = (await cookies()).get(lockCookie(slug))?.value;
  if (token && (await tokenValid(slug, token))) return true;
  return supabaseConfigured ? isOwner() : false;
}
