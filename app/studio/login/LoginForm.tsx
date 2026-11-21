"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { studioClient } from "@/lib/supabase/browser";
import { STUDIO_OWNER_EMAIL } from "@/lib/supabase/env";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!configured) return setError("Studio isn’t connected to Supabase yet. Add the settings to .env.local first.");
    setBusy(true);
    const supabase = studioClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.user) {
      setBusy(false);
      return setError("That email and password don’t match.");
    }
    if (data.user.email?.toLowerCase() !== STUDIO_OWNER_EMAIL) {
      await supabase.auth.signOut();
      setBusy(false);
      return setError("This account can’t open Studio.");
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/studio") ? next : "/studio/projects");
    router.refresh();
  };

  const field = "h-10 w-full rounded-md border border-studio-line bg-paper px-3 text-sm outline-none transition focus:border-studio-primary focus:ring-1 focus:ring-studio-primary";
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {!configured && (
        <p role="status" className="rounded-md bg-studio-selected px-3 py-2.5 text-sm">
          Studio isn’t connected yet. Add the Supabase settings to <code>.env.local</code> and restart the dev server.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md bg-error-bg px-3 py-2.5 text-sm text-error">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="s-email" className="text-sm">Email</label>
        <input id="s-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="s-password" className="text-sm">Password</label>
        <input id="s-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
      </div>
      <button type="submit" disabled={busy} className="flex h-10 cursor-pointer items-center justify-center rounded-md bg-studio-primary text-sm font-medium text-paper transition hover:bg-studio-primary-hover disabled:opacity-60">
        {busy ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
