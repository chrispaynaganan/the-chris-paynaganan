import { readFile } from "node:fs/promises";
import path from "node:path";
import { getProject } from "@/lib/content";
import { isUnlocked } from "@/lib/lock";
import { adminClient } from "@/lib/supabase/server";

// Project documents (PDFs) uploaded in Studio. They live in the private "studio-files" bucket
// (supabase/0014_studio_files.sql), so this route is the only way to open them:
// open projects serve them to anyone, projects under NDA only to visitors who unlocked them.
export async function GET(_req: Request, ctx: RouteContext<"/files/[slug]/[file]">) {
  const { slug, file } = await ctx.params;
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-z0-9-]+\.pdf$/.test(file)) return new Response("Not found", { status: 404 });

  const project = await getProject(slug);
  if (!project) return new Response("Not found", { status: 404 });
  const locked = Boolean(project.locked);
  if (locked && !(await isUnlocked(slug))) {
    return new Response("This project is password protected.", { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  let body: ArrayBuffer | null = null;
  const db = adminClient();
  if (db) {
    const { data } = await db.storage.from("studio-files").download(`${slug}/${file}`);
    if (data) body = await data.arrayBuffer();
  }
  // Files committed to the repo (private/projects/<slug>/) work too, e.g. before Supabase is set up
  if (!body) {
    try {
      const buf = await readFile(path.join(process.cwd(), "private", "projects", slug, file));
      body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}-${file}"`,
      "Cache-Control": locked ? "private, max-age=3600" : "public, max-age=300, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
