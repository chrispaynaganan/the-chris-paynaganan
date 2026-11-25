import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { STUDIO_OWNER_EMAIL, SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";

// NDA projects: project pages are static and show a password box for locked projects.
// A visitor holding that project's unlock cookie (or any Studio sign-in) is quietly served
// /projects/<slug>/unlocked instead, which checks the cookie properly. Cookie presence is
// all this looks at, so it costs nothing for everyone else.
const PROJECT = /^\/projects\/([a-z0-9-]+)(?:\/(documentation|design-system))?\/?$/;

function ndaRewrite(request: NextRequest) {
  const m = request.nextUrl.pathname.match(PROJECT);
  if (!m) return null;
  const [, slug, kind] = m;
  const cookies = request.cookies.getAll();
  const hasUnlock = cookies.some((c) => c.name === `nda-${slug}`);
  const signedIn = cookies.some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasUnlock && !signedIn) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/projects/${slug}/unlocked${kind ? `/${kind}` : ""}`;
  return NextResponse.rewrite(url);
}

// Runs before /studio pages (Next.js 16 calls this file proxy.ts):
// keeps the Studio sign-in fresh, and lets only the owner past the login page.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/projects/")) return ndaRewrite(request) ?? NextResponse.next();

  let response = NextResponse.next({ request });
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
  matcher: ["/studio/:path*", "/projects/:path*"],
};
