import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, STUDIO_OWNER_EMAIL } from "./env";

/** Reads public content (published rows only). No cookies, so pages can stay static. */
export function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

/** The signed-in Studio session on the server (route guards and server actions). */
export async function sessionClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a page render, where cookies are read-only; the proxy refreshes them instead
        }
      },
    },
  });
}

/** True only when the current request is signed in as the owner. */
export async function isOwner() {
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email?.toLowerCase() === STUDIO_OWNER_EMAIL;
}

/** Server-only key that bypasses database rules. Used only to save form inquiries. */
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof window !== "undefined" || !key || !SUPABASE_URL) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
