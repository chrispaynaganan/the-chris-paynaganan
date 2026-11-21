import type { Metadata } from "next";
import { Suspense } from "react";
import { supabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

// Reads ?next= on the server, so the form arrives with the page
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl bg-paper p-8 shadow-float">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-studio-primary text-sm font-semibold text-paper">CP</span>
          <h1 className="text-2xl font-semibold">Log in to Studio</h1>
          <p className="text-sm text-studio-muted">The editor for chrispaynaganan.com. Only Chris can sign in.</p>
        </div>
        <Suspense>
          <LoginForm configured={supabaseConfigured} />
        </Suspense>
      </div>
    </div>
  );
}
