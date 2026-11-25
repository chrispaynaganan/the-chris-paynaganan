"use client";

import { useEffect, useId, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/cn";
import { studioClient } from "@/lib/supabase/browser";
import { Section, Toggle } from "./fields";

type Run = (fn: () => PromiseLike<{ error: unknown } | void>) => Promise<boolean>;

/**
 * "Password protection" in a project's panel. Passwords are stored hashed (supabase/0009),
 * so Studio can only tell whether one is set, never show it. Saving a new one signs out
 * everyone who unlocked with the old one.
 */
export function ProjectLock({ slug, locked, onLockedChange, run }: { slug: string; locked: boolean; onLockedChange: (v: boolean) => void; run: Run }) {
  const db = studioClient();
  const id = useId();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let live = true;
    db.rpc("studio_project_has_password", { p_slug: slug }).then(({ data, error }: { data: unknown; error: unknown }) => {
      if (live) setHasPassword(error ? false : data === true);
    });
    return () => {
      live = false;
    };
  }, [db, slug]);

  const save = async () => {
    const pw = draft.trim();
    if (pw.length < 4) {
      setError("Use at least 4 characters.");
      return;
    }
    setError("");
    const ok = await run(() => db.rpc("studio_set_project_password", { p_slug: slug, p_password: pw }));
    if (!ok) {
      setError("Couldn’t save. Has supabase/0009_project_lock.sql been run?");
      return;
    }
    setHasPassword(true);
    setDraft("");
    setJustSaved(true);
    onLockedChange(true);
  };

  const status =
    hasPassword === null ? "Checking…" : !hasPassword ? "No password yet" : locked ? "Locked: visitors need the password" : "Password set, but the project is open to everyone";

  return (
    <Section title="Password protection" hint="For NDA work. Visitors see the title and a password box; you see everything while signed in to Studio.">
      <p className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm", locked && hasPassword ? "bg-studio-selected" : "bg-studio-surface")}>
        <LockKeyhole aria-hidden className="size-4 shrink-0" /> {status}
      </p>
      <Toggle
        label="Require a password"
        hint={hasPassword ? "Turn off to make the project public again. The password is kept." : "Save a password below first."}
        value={locked && !!hasPassword}
        onChange={(v) => {
          if (v && !hasPassword) {
            setError("Save a password first.");
            return;
          }
          onLockedChange(v);
        }}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-pw`} className="text-sm">{hasPassword ? "Change password" : "Set a password"}</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id={`${id}-pw`}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError("");
                setJustSaved(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
              }}
              placeholder={hasPassword ? "New password" : "Password"}
              className="h-9 w-full rounded-md border border-studio-line bg-paper pr-10 pl-3 text-sm outline-none transition hover:border-studio-muted focus:border-studio-primary focus:ring-1 focus:ring-studio-primary"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-studio-muted hover:text-studio-text"
            >
              {show ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!draft.trim()}
            className="h-9 shrink-0 cursor-pointer rounded-md bg-studio-primary px-3 text-sm font-medium text-paper transition hover:bg-studio-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save password
          </button>
        </div>
        {error ? (
          <span role="alert" className="text-xs text-studio-red">{error}</span>
        ) : (
          <span className="text-xs text-studio-muted">
            {justSaved ? "Saved. Anyone who unlocked with the old password will need the new one." : "Share it with recruiters yourself; it isn’t shown anywhere on the site."}
          </span>
        )}
      </div>
    </Section>
  );
}
