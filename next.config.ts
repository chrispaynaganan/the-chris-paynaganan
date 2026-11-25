import type { NextConfig } from "next";

// Screenshots uploaded in Studio live in Supabase Storage; let next/image show them
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  // NDA screenshots sit in /private and are read by app/nda/[slug]/[file]/route.ts
  outputFileTracingIncludes: { "/nda/[slug]/[file]": ["./private/**/*"] },
  experimental: {
    // Put the (small, Tailwind) stylesheet straight into the page instead of a separate
    // render-blocking request. Most visitors are first-timers, so this paints sooner.
    inlineCss: true,
  },
  // Addresses from the old site, sent to where that content lives now
  async redirects() {
    return [
      { source: "/services", destination: "/business", permanent: true },
      { source: "/projects", destination: "/", permanent: true },
      { source: "/faq", destination: "/business#faq", permanent: true },
      { source: "/saved", destination: "/", permanent: true },
      { source: "/wishlist", destination: "/", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
