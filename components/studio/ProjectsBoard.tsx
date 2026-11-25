"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { studioClient } from "@/lib/supabase/browser";
import { categories } from "@/lib/categories";
import { BoardHeader, GroupedTable, ItemPanel, Kanban, useSaver, type Column, type Group } from "./Board";
import { Pill, StatusCell } from "./StatusCell";
import type { Label } from "./colors";
import { ChipsField, DeleteButton, ImagesField, Repeater, Section, SelectField, TextField, Toggle } from "./fields";
import { BoardSkeleton, LoadError } from "./states";
import { ProjectLock } from "./ProjectLock";

type Row = {
  id: string; slug: string; position: number; published: boolean; name: string; kind: string; category: string;
  tags: string[]; stamps: string[]; year: number; years: string; role_short: string; role: string; platform: string;
  status: "live" | "not-shipped" | "handed-off"; live_url: string | null; preview_url: string | null; preview_mobile_url?: string | null; locked?: boolean; docs_url: string | null; design_system_url: string | null;
  screenshots: { label: string; src?: string }[]; facts: Record<string, unknown>[]; stats: Record<string, unknown>[];
  entries: Record<string, unknown>[]; updated_at: string;
};

const statuses: Label[] = [
  { value: "live", label: "Live", color: "green" },
  { value: "handed-off", label: "Handed off", color: "blue" },
  { value: "not-shipped", label: "Not shipped", color: "orange" },
];
const visibility: Label[] = [
  { value: "published", label: "Published", color: "green" },
  { value: "draft", label: "Draft", color: "grey" },
];
const stages = [
  { stage: "overview", label: "Overview" },
  { stage: "challenge", label: "Context & challenge" },
  { stage: "approach", label: "Approach" },
  { stage: "outcome", label: "Outcome" },
  { stage: "reflection", label: "Reflection" },
];

const when = (iso: string) => new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
const slugify = (v: string) => v.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";

export function ProjectsBoard() {
  const db = studioClient();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [niches, setNiches] = useState<{ value: string; label: string }[]>([]);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [slugError, setSlugError] = useState("");
  const { state, run } = useSaver();

  const load = useCallback(async () => {
    const [p, n] = await Promise.all([
      db.from("studio_projects").select("*").order("position"),
      db.from("studio_items").select("title, data").eq("board", "site").eq("group_key", "niches").order("position"),
    ]);
    if (p.error) return setFailed(true);
    setRows(p.data as Row[]);
    setNiches(((n.data ?? []) as { title: string; data: { id?: string } }[]).map((x) => ({ value: x.data.id ?? "", label: x.title })).filter((x) => x.value));
  }, [db]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the board once on open
    void load();
  }, [load]);

  const patch = (id: string, change: Partial<Row>) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...change } : r)) ?? rs);
    return run(() => db.from("studio_projects").update(change).eq("id", id));
  };

  const create = async (title = "New project") => {
    const taken = new Set((rows ?? []).map((r) => r.slug));
    let slug = slugify(title);
    for (let i = 2; taken.has(slug); i++) slug = `${slugify(title)}-${i}`;
    const position = Math.max(-1, ...(rows ?? []).map((r) => r.position)) + 1;
    await run(async () => {
      const res = await db
        .from("studio_projects")
        .insert({ slug, name: title, position, published: false, entries: stages.map((s) => ({ ...s, date: "", body: "" })) })
        .select()
        .single();
      if (!res.error && res.data) {
        setRows((rs) => [...(rs ?? []), res.data as Row]);
        setOpenId((res.data as Row).id);
      }
      return res;
    });
  };

  const reorder = (_group: string, ids: string[]) => {
    // Keep these rows' existing slots overall, in their new order
    const slots = (rows ?? []).filter((r) => ids.includes(r.id)).map((r) => r.position).sort((a, b) => a - b);
    const next = new Map(ids.map((id, i) => [id, slots[i]]));
    setRows((rs) => rs?.map((r) => (next.has(r.id) ? { ...r, position: next.get(r.id)! } : r)) ?? rs);
    void run(async () => {
      const results = await Promise.all(ids.map((id) => db.from("studio_projects").update({ position: next.get(id) }).eq("id", id)));
      return results.find((r) => r.error) ?? { error: null };
    });
  };

  const remove = async (id: string) => {
    setOpenId(null);
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? rs);
    await run(() => db.from("studio_projects").delete().eq("id", id));
  };

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (rows ?? []).filter((r) => !q || `${r.name} ${r.kind} ${r.category}`.toLowerCase().includes(q)).sort((a, b) => a.position - b.position), [rows, q]);

  const groups: Group<Row>[] = [
    { key: "drafts", label: "Drafts", color: "grey", rows: visible.filter((r) => !r.published), addable: true },
    ...statuses.map((s) => ({ key: s.value, label: s.label, color: s.color, rows: visible.filter((r) => r.published && r.status === s.value), addable: false })),
  ];

  const columns: Column<Row>[] = [
    { key: "status", label: "Status", width: "9rem", flush: true, render: (r) => <StatusCell label="Status" labels={statuses} value={r.status} onChange={(v) => void patch(r.id, { status: v as Row["status"] })} /> },
    { key: "visibility", label: "On the site", width: "9rem", flush: true, render: (r) => <StatusCell label="On the site" labels={visibility} value={r.published ? "published" : "draft"} onChange={(v) => void patch(r.id, { published: v === "published" })} /> },
    { key: "years", label: "Timeline", width: "10rem", render: (r) => <span className="truncate">{r.years}</span> },
    { key: "platform", label: "Platform", width: "10rem", render: (r) => <span className="truncate">{r.platform}</span> },
    { key: "niches", label: "Niches", width: "7rem", render: (r) => <span className="text-studio-muted">{r.stamps.length}</span> },
    { key: "updated", label: "Updated", width: "7rem", render: (r) => <span className="text-studio-muted">{when(r.updated_at)}</span> },
  ];

  const open = rows?.find((r) => r.id === openId) ?? null;

  const saveSlug = async (v: string) => {
    if (!open) return;
    const slug = slugify(v);
    if ((rows ?? []).some((r) => r.slug === slug && r.id !== open.id)) return setSlugError("Another project already uses that address.");
    setSlugError("");
    await patch(open.id, { slug });
  };

  return (
    <div className="flex flex-col">
      <BoardHeader
        title="Projects"
        description="Your case studies. Drafts stay hidden until you publish them."
        views={[
          { key: "table", label: "Main table" },
          { key: "kanban", label: "Kanban" },
        ]}
        view={view}
        onView={setView}
        query={query}
        onQuery={setQuery}
        onNew={() => void create()}
        newLabel="New project"
        save={state}
      />
      {failed ? (
        <LoadError onRetry={() => { setFailed(false); void load(); }} />
      ) : !rows ? (
        <BoardSkeleton />
      ) : view === "table" ? (
        <GroupedTable itemLabel="Project" groups={groups} columns={columns} getId={(r) => r.id} getTitle={(r) => r.name} onOpen={(r) => setOpenId(r.id)} onAdd={(_g, t) => void create(t)} onReorder={reorder} />
      ) : (
        <Kanban
          lanes={statuses.map((s) => ({ key: s.value, label: s.label, color: s.color }))}
          rows={visible}
          laneOf={(r) => r.status}
          getId={(r) => r.id}
          onMove={(id, lane) => void patch(id, { status: lane as Row["status"] })}
          onOpen={(r) => setOpenId(r.id)}
          card={(r) => (
            <>
              <span className="font-medium">{r.name}</span>
              <span className="text-studio-muted">{r.kind}</span>
              <span className="flex items-center justify-between">
                <Pill labels={visibility} value={r.published ? "published" : "draft"} />
                <span className="text-xs text-studio-muted">{r.years}</span>
              </span>
            </>
          )}
        />
      )}

      <ItemPanel
        open={!!open}
        onClose={() => {
          setOpenId(null);
          setSlugError("");
        }}
        title={open?.name ?? ""}
        onTitle={(v) => open && void patch(open.id, { name: v })}
        save={state}
        meta={
          open && (
            <div className="flex flex-wrap items-center gap-2">
              <Pill labels={statuses} value={open.status} />
              <Pill labels={visibility} value={open.published ? "published" : "draft"} />
              {open.published && (
                <a href={`/projects/${open.slug}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-studio-primary hover:underline">
                  View on site <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              )}
            </div>
          )
        }
        footer={open && <DeleteButton label="Delete project" onConfirm={() => void remove(open.id)} />}
      >
        {open && (
          <div className="flex flex-col gap-6">
            <Section title="Visibility">
              <Toggle label="Published" hint="Shows the project on the site." value={open.published} onChange={(v) => void patch(open.id, { published: v })} />
              <TextField label="Web address" value={open.slug} onCommit={(v) => void saveSlug(v)} hint={slugError || `chrispaynaganan.com/projects/${open.slug}`} />
            </Section>

            <Section title="Card and title">
              <TextField label="Type of project" value={open.kind} onCommit={(v) => void patch(open.id, { kind: v })} placeholder="Healthcare workforce platform" />
              <TextField label="Category line" value={open.category} onCommit={(v) => void patch(open.id, { category: v })} placeholder="Healthcare SaaS · UI/UX design" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Timeline" value={open.years} onCommit={(v) => void patch(open.id, { years: v })} placeholder="Mar–Jul 2026" />
                <TextField label="Start year" type="number" value={String(open.year)} onCommit={(v) => void patch(open.id, { year: Number(v) || open.year })} />
              </div>
              <TextField label="Role, short (on the card)" value={open.role_short} onCommit={(v) => void patch(open.id, { role_short: v })} />
              <TextField label="Role, full" value={open.role} onCommit={(v) => void patch(open.id, { role: v })} />
              <TextField label="Platform" value={open.platform} onCommit={(v) => void patch(open.id, { platform: v })} placeholder="Web, iOS + Android…" />
            </Section>

            <Section title="Status and links" hint="The Documentation and Design system buttons open these links once they’re set.">
              <SelectField label="Status" value={open.status} options={statuses.map((s) => ({ value: s.value, label: s.label }))} onChange={(v) => void patch(open.id, { status: v as Row["status"] })} />
              <TextField label="Live site" type="url" value={open.live_url ?? ""} onCommit={(v) => void patch(open.id, { live_url: v || null })} />
              <TextField label="Preview (prototype of unshipped work)" type="url" value={open.preview_url ?? ""} onCommit={(v) => void patch(open.id, { preview_url: v || null })} placeholder="Shows as “Try the preview”, not as a live site" />
              <TextField label="Mobile preview (optional second prototype)" type="url" value={open.preview_mobile_url ?? ""} onCommit={(v) => void patch(open.id, { preview_mobile_url: v || null })} placeholder="With both set: “Try the web preview” and “Try the mobile preview”" />
              <TextField label="Project documentation" type="url" value={open.docs_url ?? ""} onCommit={(v) => void patch(open.id, { docs_url: v || null })} />
              <TextField label="Design system" type="url" value={open.design_system_url ?? ""} onCommit={(v) => void patch(open.id, { design_system_url: v || null })} />
            </Section>

            <ProjectLock key={open.id} slug={open.slug} locked={!!open.locked} onLockedChange={(v) => void patch(open.id, { locked: v })} run={run} />

            <Section title="Where it shows up">
              <ChipsField label="Categories (home filter bar)" value={open.tags} options={categories.filter((c) => c.id !== "all").map((c) => ({ value: c.id, label: c.label }))} onChange={(v) => void patch(open.id, { tags: v })} />
              <ChipsField label="Niches (stamps it earns)" value={open.stamps} options={niches} onChange={(v) => void patch(open.id, { stamps: v })} hint="Add new niches on the Site & About board." />
            </Section>

            <Section title="Screenshots" hint="The first one is the main image on the card and the project page.">
              <ImagesField label="Images" folder={`projects/${open.slug}`} items={open.screenshots} onCommit={(v) => void patch(open.id, { screenshots: v })} />
            </Section>

            <Section title="Diary" hint="The gist of each stage, written like a diary entry.">
              <Repeater
                label="Entries"
                addLabel="Add entry"
                blank={{ stage: "", label: "", date: "", body: "" }}
                itemTitle={(it, i) => String(it.label || `Entry ${i + 1}`)}
                fields={[
                  { key: "label", label: "Heading" },
                  { key: "date", label: "Date line", },
                  { key: "body", label: "Entry", multiline: true, rows: 5 },
                ]}
                items={open.entries}
                onCommit={(v) => void patch(open.id, { entries: v.map((e, i) => ({ ...e, stage: String(e.stage || `entry-${i + 1}`) })) })}
              />
            </Section>

            <Section title="Highlights">
              <Repeater label="Quick facts" addLabel="Add fact" blank={{ label: "", value: "" }} itemTitle={(it, i) => String(it.label || `Fact ${i + 1}`)} fields={[{ key: "label", label: "Title" }, { key: "value", label: "Detail", multiline: true, rows: 2 }]} items={open.facts} onCommit={(v) => void patch(open.id, { facts: v })} />
              <Repeater label="Stats" addLabel="Add stat" blank={{ value: "", label: "" }} itemTitle={(it, i) => String(it.value || `Stat ${i + 1}`)} fields={[{ key: "value", label: "Number", }, { key: "label", label: "What it means" }]} items={open.stats} onCommit={(v) => void patch(open.id, { stats: v })} />
            </Section>
          </div>
        )}
      </ItemPanel>
    </div>
  );
}
