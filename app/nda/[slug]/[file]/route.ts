import { readFile } from "node:fs/promises";
import path from "node:path";
import { isUnlocked } from "@/lib/lock";

// Screenshots of NDA projects. They live in /private (not /public), so the only way to load
// them is through here, and this only answers visitors who have unlocked the project.
const TYPES: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", avif: "image/avif" };

export async function GET(_req: Request, ctx: RouteContext<"/nda/[slug]/[file]">) {
  const { slug, file } = await ctx.params;
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+\.[a-z]+$/.test(file) || !TYPES[ext]) {
    return new Response("Not found", { status: 404 });
  }
  if (!(await isUnlocked(slug))) {
    return new Response("This project is password protected.", { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const body = await readFile(path.join(process.cwd(), "private", "projects", slug, file));
    return new Response(new Uint8Array(body), {
      headers: { "Content-Type": TYPES[ext], "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
