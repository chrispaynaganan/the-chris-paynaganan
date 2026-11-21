"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { studioClient } from "@/lib/supabase/browser";
import { BoardHeader, GroupedTable, ItemPanel, useSaver, type Column } from "./Board";
import { StatusCell } from "./StatusCell";
import type { Label } from "./colors";
import { DeleteButton, ImagesField, LinesField, Repeater, Section, SelectField, TextField, Toggle } from "./fields";
import { businessBoard, getPath, setPath, siteBoard, type FieldSpec } from "./schema";
import { BoardSkeleton, LoadError } from "./states";

type Item = { id: string; board: string; group_key: string; position: number; title: string; data: Record<string, unknown>; published: boolean; updated_at: string };

const shown: Label[] = [
  { value: "shown", label: "Shown", color: "green" },
  { value: "hidden", label: "Hidden", color: "grey" },
];

const when = (iso: string) => new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

// Board definitions hold functions (summaries), so they're looked up here on the client
// rather than passed in from the server page.
const specs = { business: businessBoard, site: siteBoard };

export function ItemsBoard({ board }: { board: keyof typeof specs }) {
  const spec = specs[board];
  const db = studioClient();
  const [rows, setRows] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { state, run } = useSaver();

  const load = useCallback(async () => {
    const { data, error } = await db.from("studio_items").select("*").eq("board", spec.board).order("position");
    if (error) return setFailed(true);
    setRows(data as Item[]);
  }, [db, spec.board]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the board once on open
    void load();
  }, [load]);

  const patch = (id: string, change: Partial<Item>) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...change } : r)) ?? rs);
    return run(() => db.from("studio_items").update(change).eq("id", id));
  };

  const add = async (groupKey: string, title: string) => {
    const g = spec.groups.find((x) => x.key === groupKey);
    const position = Math.max(-1, ...(rows ?? []).filter((r) => r.group_key === groupKey).map((r) => r.position)) + 1;
    await run(async () => {
      const res = await db.from("studio_items").insert({ board: spec.board, group_key: groupKey, title, position, data: g?.defaults ?? {} }).select().single();
      if (!res.error && res.data) setRows((rs) => [...(rs ?? []), res.data as Item]);
      return res;
    });
  };

  const reorder = (_groupKey: string, ids: string[]) => {
    setRows((rs) => rs?.map((r) => (ids.includes(r.id) ? { ...r, position: ids.indexOf(r.id) } : r)) ?? rs);
    void run(async () => {
      const results = await Promise.all(ids.map((id, i) => db.from("studio_items").update({ position: i }).eq("id", id)));
      return results.find((r) => r.error) ?? { error: null };
    });
  };

  const remove = async (id: string) => {
    setOpenId(null);
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? rs);
    await run(() => db.from("studio_items").delete().eq("id", id));
  };

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      spec.groups.map((g) => ({
        key: g.key,
        label: g.label,
        color: g.color,
        addable: !g.single,
        rows: (rows ?? [])
          .filter((r) => r.group_key === g.key)
          .filter((r) => !q || `${r.title} ${JSON.stringify(r.data)}`.toLowerCase().includes(q))
          .sort((a, b) => a.position - b.position),
      })),
    [rows, spec.groups, q],
  );

  const columns: Column<Item>[] = [
    {
      key: "shown",
      label: "On the site",
      width: "9rem",
      flush: true,
      render: (r) => <StatusCell label="On the site" labels={shown} value={r.published ? "shown" : "hidden"} onChange={(v) => void patch(r.id, { published: v === "shown" })} />,
    },
    {
      key: "summary",
      label: "Summary",
      width: "minmax(14rem, 3fr)",
      render: (r) => <span className="w-full truncate text-left text-studio-muted">{spec.groups.find((g) => g.key === r.group_key)?.summary(r.title, r.data)}</span>,
    },
    { key: "updated", label: "Updated", width: "7rem", render: (r) => <span className="text-studio-muted">{when(r.updated_at)}</span> },
  ];

  const open = rows?.find((r) => r.id === openId) ?? null;
  const group = open ? spec.groups.find((g) => g.key === open.group_key) : null;

  return (
    <div className="flex flex-col">
      <BoardHeader title={spec.title} description={spec.description} query={query} onQuery={setQuery} save={state} />
      {failed ? (
        <LoadError onRetry={() => { setFailed(false); void load(); }} />
      ) : !rows ? (
        <BoardSkeleton />
      ) : (
        <GroupedTable groups={groups} columns={columns} getId={(r) => r.id} getTitle={(r) => r.title} onOpen={(r) => setOpenId(r.id)} onAdd={add} onReorder={reorder} />
      )}

      <ItemPanel
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.title ?? ""}
        onTitle={(v) => open && void patch(open.id, { title: v })}
        save={state}
        meta={open && group && <span className="text-sm text-studio-muted">{group.label}</span>}
        footer={open && group && !group.single && <DeleteButton label={`Delete this ${group.itemLabel.toLowerCase()}`} onConfirm={() => void remove(open.id)} />}
      >
        {open && group && (
          <div className="flex flex-col gap-6">
            <Section title="Visibility">
              <Toggle label="Show on the site" value={open.published} onChange={(v) => void patch(open.id, { published: v })} />
            </Section>
            {group.fields.length > 0 && (
              <Section title="Details">
                {group.fields.map((f) => (
                  <Field key={f.key} spec={f} item={open} onCommit={(value) => void patch(open.id, { data: setPath(open.data, f.key, value) })} />
                ))}
              </Section>
            )}
          </div>
        )}
      </ItemPanel>
    </div>
  );
}

function Field({ spec, item, onCommit }: { spec: FieldSpec; item: Item; onCommit: (v: unknown) => void }) {
  const v = getPath(item.data, spec.key);
  switch (spec.type) {
    case "text":
    case "url":
    case "email":
      return <TextField label={spec.label} hint={spec.hint} placeholder={spec.placeholder} type={spec.type === "email" ? "email" : spec.type === "url" ? "url" : "text"} value={String(v ?? "")} onCommit={onCommit} />;
    case "textarea":
      return <TextField label={spec.label} hint={spec.hint} multiline rows={spec.rows} value={String(v ?? "")} onCommit={onCommit} />;
    case "lines":
      return <LinesField label={spec.label} hint={spec.hint} value={Array.isArray(v) ? (v as string[]) : []} onCommit={onCommit} />;
    case "toggle":
      return <Toggle label={spec.label} hint={spec.hint} value={Boolean(v)} onChange={onCommit} />;
    case "select":
      return <SelectField label={spec.label} value={String(v ?? "")} options={spec.options} onChange={onCommit} />;
    case "image":
      return (
        <ImagesField
          label={spec.label}
          hint={spec.hint}
          folder={`${item.board}/${item.group_key}`}
          items={v ? [{ label: item.title, src: String(v) }] : []}
          onCommit={(list) => onCommit(list[0]?.src ?? "")}
        />
      );
    case "sections": {
      const list = (Array.isArray(v) ? v : []) as { heading: string; body: string[] }[];
      return (
        <Repeater
          label={spec.label}
          addLabel="Add section"
          blank={{ heading: "", body: "" }}
          itemTitle={(it, i) => String(it.heading || `Section ${i + 1}`)}
          fields={[
            { key: "heading", label: "Heading" },
            { key: "body", label: "Text (a blank line starts a new paragraph)", multiline: true, rows: 5 },
          ]}
          items={list.map((x) => ({ heading: x.heading, body: (x.body ?? []).join("\n\n") }))}
          onCommit={(items) =>
            onCommit(items.map((x) => ({ heading: String(x.heading ?? ""), body: String(x.body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) })))
          }
        />
      );
    }
  }
}

