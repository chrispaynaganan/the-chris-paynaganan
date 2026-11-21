"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { studioClient } from "@/lib/supabase/browser";
import { BoardHeader, GroupedTable, ItemPanel, Kanban, useSaver, type Column, type Group } from "./Board";
import { Pill, StatusCell } from "./StatusCell";
import type { Label } from "./colors";
import { DeleteButton, Section, SelectField, TextField } from "./fields";
import { BoardSkeleton, LoadError } from "./states";

type Inquiry = {
  id: string; created_at: string; updated_at: string | null; full_name: string; email: string; company: string | null;
  source: "project" | "contact"; reason: string | null; message: string | null; bundle_category: string | null;
  bundle_tier: string | null; payment_option: string | null; timeline: string | null; project_details: string | null;
  currency: string | null; stage: string; notes: string | null;
};

const stages: Label[] = [
  { value: "new", label: "New", color: "blue" },
  { value: "replied", label: "Replied", color: "purple" },
  { value: "call", label: "Call booked", color: "orange" },
  { value: "proposal", label: "Proposal sent", color: "lime" },
  { value: "won", label: "Won", color: "green" },
  { value: "lost", label: "Lost", color: "red" },
];
const sources: Label[] = [
  { value: "project", label: "Project", color: "dark" },
  { value: "contact", label: "Message", color: "blue" },
];

const day = (iso: string) => new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const about = (r: Inquiry) => (r.source === "project" ? r.bundle_tier : r.reason) ?? "";

export function InquiriesBoard() {
  const db = studioClient();
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  // Inquiries are private: saving them never touches the public site
  const { state, run } = useSaver(false);

  const load = useCallback(async () => {
    const { data, error } = await db.from("inquiries").select("*").order("created_at", { ascending: false });
    if (error) return setFailed(true);
    setRows(data as Inquiry[]);
  }, [db]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the board once on open
    void load();
  }, [load]);

  const patch = (id: string, change: Partial<Inquiry>) => {
    setRows((rs) => rs?.map((r) => (r.id === id ? { ...r, ...change } : r)) ?? rs);
    return run(() => db.from("inquiries").update(change).eq("id", id));
  };
  const remove = async (id: string) => {
    setOpenId(null);
    setRows((rs) => rs?.filter((r) => r.id !== id) ?? rs);
    await run(() => db.from("inquiries").delete().eq("id", id));
  };

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (rows ?? []).filter((r) => !q || `${r.full_name} ${r.email} ${r.company ?? ""} ${about(r)}`.toLowerCase().includes(q)), [rows, q]);
  const groups: Group<Inquiry>[] = stages.map((s) => ({ key: s.value, label: s.label, color: s.color, rows: visible.filter((r) => (r.stage ?? "new") === s.value), addable: false }));

  const columns: Column<Inquiry>[] = [
    { key: "stage", label: "Stage", width: "9rem", flush: true, render: (r) => <StatusCell label="Stage" labels={stages} value={r.stage ?? "new"} onChange={(v) => void patch(r.id, { stage: v })} /> },
    { key: "source", label: "Type", width: "7rem", render: (r) => <Pill labels={sources} value={r.source ?? "project"} /> },
    { key: "about", label: "About", width: "minmax(10rem, 1.5fr)", render: (r) => <span className="w-full truncate text-left">{about(r)}</span> },
    { key: "email", label: "Email", width: "minmax(10rem, 1.5fr)", render: (r) => <a href={`mailto:${r.email}`} className="w-full truncate text-left text-studio-primary hover:underline">{r.email}</a> },
    { key: "timeline", label: "Timeline", width: "8rem", render: (r) => <span className="truncate text-studio-muted">{r.timeline ?? "—"}</span> },
    { key: "received", label: "Received", width: "8rem", render: (r) => <span className="text-studio-muted">{day(r.created_at)}</span> },
  ];

  const open = rows?.find((r) => r.id === openId) ?? null;
  const facts: [string, string | null | undefined][] = open
    ? [
        ["Email", open.email],
        ["Company", open.company],
        ["Received", day(open.created_at)],
        ...(open.source === "project"
          ? ([
              ["Bundle", [open.bundle_tier, open.bundle_category && `(${open.bundle_category})`].filter(Boolean).join(" ")],
              ["Payment", open.payment_option],
              ["Timeline", open.timeline],
              ["Currency", open.currency?.toUpperCase()],
            ] as [string, string | null | undefined][])
          : ([["About", open.reason]] as [string, string | null | undefined][])),
      ]
    : [];

  return (
    <div className="flex flex-col">
      <BoardHeader
        title="Inquiries"
        description="Messages from the contact and project forms. Move them along as you go."
        views={[
          { key: "table", label: "Main table" },
          { key: "kanban", label: "Kanban" },
        ]}
        view={view}
        onView={setView}
        query={query}
        onQuery={setQuery}
        save={state}
      />
      {failed ? (
        <LoadError onRetry={() => { setFailed(false); void load(); }} />
      ) : !rows ? (
        <BoardSkeleton />
      ) : rows.length === 0 ? (
        <p className="px-6 py-10 text-sm text-studio-muted">No inquiries yet. New messages from the site will show up here.</p>
      ) : view === "table" ? (
        <GroupedTable itemLabel="Inquiry" groups={groups} columns={columns} getId={(r) => r.id} getTitle={(r) => r.full_name} onOpen={(r) => setOpenId(r.id)} />
      ) : (
        <Kanban
          lanes={stages.map((s) => ({ key: s.value, label: s.label, color: s.color }))}
          rows={visible}
          laneOf={(r) => r.stage ?? "new"}
          getId={(r) => r.id}
          onMove={(id, lane) => void patch(id, { stage: lane })}
          onOpen={(r) => setOpenId(r.id)}
          card={(r) => (
            <>
              <span className="font-medium">{r.full_name}</span>
              <span className="truncate text-studio-muted">{about(r)}</span>
              <span className="flex items-center justify-between">
                <Pill labels={sources} value={r.source ?? "project"} />
                <span className="text-xs text-studio-muted">{day(r.created_at)}</span>
              </span>
            </>
          )}
        />
      )}

      <ItemPanel
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.full_name ?? ""}
        save={state}
        meta={
          open && (
            <div className="flex items-center gap-2">
              <Pill labels={stages} value={open.stage ?? "new"} />
              <Pill labels={sources} value={open.source ?? "project"} />
            </div>
          )
        }
        footer={
          open && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(open.source === "project" ? `Re: your ${open.bundle_tier ?? "project"} inquiry` : `Re: ${open.reason ?? "your message"}`)}`}
                className="flex h-8 items-center gap-1.5 rounded-md bg-studio-primary px-3 text-sm font-medium text-paper transition hover:bg-studio-primary-hover"
              >
                <Mail aria-hidden className="size-4" /> Reply by email
              </a>
              <DeleteButton label="Delete inquiry" onConfirm={() => void remove(open.id)} />
            </div>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-6">
            <Section title="Stage">
              <SelectField label="Where this lead is" value={open.stage ?? "new"} options={stages.map((s) => ({ value: s.value, label: s.label }))} onChange={(v) => void patch(open.id, { stage: v })} />
            </Section>
            <Section title="Details">
              <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                {facts
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-studio-muted">{k}</dt>
                      <dd className="col-span-2 break-words">{v}</dd>
                    </div>
                  ))}
              </dl>
            </Section>
            <Section title={open.source === "project" ? "Project details" : "Message"}>
              <p className="text-sm whitespace-pre-wrap">{(open.source === "project" ? open.project_details : open.message) || "No message."}</p>
            </Section>
            <Section title="Your notes" hint="Only you can see these.">
              <TextField label="Notes" multiline rows={5} value={open.notes ?? ""} onCommit={(v) => void patch(open.id, { notes: v })} />
            </Section>
          </div>
        )}
      </ItemPanel>
    </div>
  );
}
