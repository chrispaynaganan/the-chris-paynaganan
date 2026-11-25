"use server";

import { cookies } from "next/headers";
import { LOCK_MAX_AGE, lockCookie, unlockToken } from "@/lib/lock";

/** Checks the password for an NDA project and, if it's right, remembers it in a cookie. */
export async function unlockProject(slug: string, password: string) {
  const pw = password.trim();
  if (!pw || !/^[a-z0-9-]+$/.test(slug)) return { ok: false as const };
  const token = await unlockToken(slug, pw);
  if (!token) return { ok: false as const };
  (await cookies()).set(lockCookie(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LOCK_MAX_AGE,
  });
  return { ok: true as const };
}
