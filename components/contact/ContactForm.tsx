"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/Notice";
import { Confirmation } from "@/components/ui/Confirmation";

type Values = { name: string; email: string; company: string; reason: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;
const empty: Values = { name: "", email: "", company: "", reason: "", message: "" };

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email, like you@company.com.";
  if (!v.reason) e.reason = "Pick what this is about.";
  if (!v.message.trim()) e.message = "Add a short message.";
  return e;
}

/** For recruiters and anyone else. Opens the visitor's email app with everything filled in. */
export function ContactForm({ email, reasons }: { email: string; reasons: string[] }) {
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    setSent(false);
    if (tried) setErrors(validate(next));
  };
  const field = (k: keyof Values) =>
    cn("min-h-10 w-full rounded-lg border bg-paper px-3 py-2 text-sm transition", errors[k] ? "border-2 border-error-accent" : "border-field focus:border-ink");
  const err = (k: keyof Values) =>
    errors[k] ? <span id={`c-${k}-err`} className="text-sm text-error-accent">{errors[k]}</span> : null;
  const aria = (k: keyof Values) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `c-${k}-err` } : {});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(v);
    setTried(true);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const body = [`Name: ${v.name}`, `Email: ${v.email}`, `Company: ${v.company || "—"}`, "", v.message].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`${v.reason}: ${v.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setTried(false);
    setV(empty);
  };

  return (
    <>
    <Confirmation open={sent} onClose={() => setSent(false)} dark={false} title="Your message is ready" steps={["Send the email that just opened in your email app.", "I read every message myself and reply within a day or two.", "If it’s a fit, we’ll set up a call."]} />
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {Object.keys(errors).length > 0 && (
        <Notice tone="error" role="alert" className="sm:col-span-2">A few fields need a look before this can go out.</Notice>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-name" className="text-sm font-medium">Your name *</label>
        <input id="c-name" value={v.name} onChange={set("name")} autoComplete="name" className={field("name")} {...aria("name")} />
        {err("name")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-email" className="text-sm font-medium">Email *</label>
        <input id="c-email" type="email" value={v.email} onChange={set("email")} autoComplete="email" className={field("email")} {...aria("email")} />
        {err("email")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-company" className="text-sm font-medium">Company</label>
        <input id="c-company" value={v.company} onChange={set("company")} autoComplete="organization" className={field("company")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="c-reason" className="text-sm font-medium">What’s this about? *</label>
        <select id="c-reason" value={v.reason} onChange={set("reason")} className={field("reason")} {...aria("reason")}>
          <option value="">Choose one</option>
          {reasons.map((r) => <option key={r}>{r}</option>)}
        </select>
        {err("reason")}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="c-message" className="text-sm font-medium">Message *</label>
        <textarea id="c-message" rows={5} value={v.message} onChange={set("message")} className={cn(field("message"), "resize-y")} {...aria("message")} />
        {err("message")}
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className={buttonClass("primary")}>Send message</button>
        <a href={`mailto:${email}`} className={buttonClass("tertiary")}>Or email me directly</a>
      </div>
    </form>
    </>
  );
}
