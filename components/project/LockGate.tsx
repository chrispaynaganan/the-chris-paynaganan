"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { motion, useAnimationControls } from "motion/react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { unlockProject } from "@/app/actions/unlock";
import { buttonClass, glassButtonClass } from "@/components/ui/button";
import { GlassFill } from "@/components/ui/Glass";
import { cn } from "@/lib/cn";

/** Password box for an NDA project. The right password reloads the page with everything showing. */
export function LockGate({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const id = useId();
  const shake = useAnimationControls();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    start(async () => {
      const res = await unlockProject(slug, password);
      if (res.ok) {
        router.refresh();
        return;
      }
      setWrong(true);
      shake.start({ x: [0, -8, 8, -6, 6, -3, 0], transition: { duration: 0.45 } });
    });
  };

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col items-center gap-6 rounded-card border border-line-strong px-6 py-14 text-center shadow-float md:py-20">
      <span className="flex size-14 items-center justify-center rounded-full bg-ink text-paper">
        <LockKeyhole aria-hidden className="size-6" />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 id={`${id}-title`} className="text-xl font-semibold">{name} is under NDA</h2>
        <p className="text-muted">
          The screens, story and numbers are password protected. If you&rsquo;re a recruiter or hiring manager, ask me for the password and it&rsquo;s yours.
        </p>
      </div>
      <motion.form animate={shake} onSubmit={submit} className="flex w-full max-w-sm flex-col gap-3">
        <label htmlFor={`${id}-pw`} className="sr-only">Password</label>
        <div className="relative">
          <input
            id={`${id}-pw`}
            type={show ? "text" : "password"}
            autoComplete="off"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setWrong(false);
            }}
            placeholder="Password"
            aria-invalid={wrong}
            aria-describedby={wrong ? `${id}-err` : undefined}
            className={cn(
              "h-12 w-full rounded-full border bg-paper pr-12 pl-5 outline-none transition focus:ring-2 focus:ring-ink/15",
              wrong ? "border-error-accent" : "border-field focus:border-ink",
            )}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition hover:text-ink"
          >
            {show ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        </div>
        {wrong && (
          <p id={`${id}-err`} role="alert" className="text-left text-sm text-error-accent">That&rsquo;s not it. Check for typos and try again.</p>
        )}
        <button type="submit" disabled={pending || !password.trim()} className={glassButtonClass("primary", "h-12")}><GlassFill variant="primary" />
          {pending ? "Checking…" : "Unlock project"}
        </button>
      </motion.form>
      <Link href="/contact" className={buttonClass("tertiary")}>Don&rsquo;t have it? Ask me</Link>
    </section>
  );
}
