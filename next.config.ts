import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
