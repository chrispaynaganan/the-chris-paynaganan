import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_OWNER_EMAIL, SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

// Runs before /studio pages (Next.js 16 calls this file proxy.ts):
// keeps the Studio sign-in fresh, and lets only the owner past the login page.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/studio/login";

  if (!supabaseConfigured) {
    if (isLogin) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/studio/login";
    url.search = "?setup=1";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the sign-in token and refreshes it if needed. Keep this call right after creating the client.
  const { data } = await supabase.auth.getClaims();
  const email = String(data?.claims?.email ?? "").toLowerCase();
  const owner = email === STUDIO_OWNER_EMAIL;

  const go = (path: string, query = "") => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = query;
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!owner && !isLogin) return go("/studio/login", `?next=${encodeURIComponent(pathname + search)}`);
  if (owner && isLogin) return go("/studio/projects");
  return response;
}

export const config = {
  matcher: ["/studio/:path*"],
};
