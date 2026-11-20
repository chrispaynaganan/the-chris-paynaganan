"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/Notice";

type Values = { name: string; email: string; tier: string; pay: string; company: string; time: string; details: string };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { name: "", email: "", tier: "", pay: "", company: "", time: "", details: "" };

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email, like you@company.com.";
  if (!v.tier) e.tier = "Pick the closest bundle.";
  if (!v.pay) e.pay = "Choose how you’d like to pay.";
  if (!v.time) e.time = "Pick a timeline.";
  return e;
}

export function InquiryForm({
  email,
  bundles,
  businessBundles,
  paymentOptions,
  timelines,
  dark = false,
}: {
  email: string;
  bundles: string[];
  businessBundles: string[];
  paymentOptions: string[];
  timelines: string[];
  dark?: boolean;
}) {
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onChoose = (e: Event) => setV((prev) => ({ ...prev, tier: (e as CustomEvent<string>).detail }));
    window.addEventListener("choose-bundle", onChoose);
    return () => window.removeEventListener("choose-bundle", onChoose);
  }, []);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    setSent(false);
    if (tried) setErrors(validate(next));
  };

  const field = (k: keyof Values) =>
    cn(
      "min-h-10 w-full rounded-lg px-3 py-2 text-sm transition",
      dark ? "bg-ink text-paper placeholder:text-paper/40" : "bg-paper text-ink",
      errors[k]
        ? dark
          ? "border-2 border-error-on-dark"
          : "border-2 border-error-accent"
        : dark
          ? "border border-paper/30 focus:border-paper"
          : "border border-field focus:border-ink",
    );

  const labelClass = cn("text-sm font-semibold", dark && "text-paper/80");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(v);
    setTried(true);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // No backend yet: open the visitor's email app with everything filled in.
    const body = [
      `Name: ${v.name}`,
      `Email: ${v.email}`,
      `Company: ${v.company || "—"}`,
      `Bundle: ${v.tier}`,
      `Payment: ${v.pay}`,
      `Timeline: ${v.time}`,
      "",
      v.details,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Project inquiry: ${v.tier}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    setTried(false);
    setV(empty);
  };

  const err = (k: keyof Values) =>
    errors[k] ? (
      <span id={`${k}-err`} className={cn("text-sm", dark ? "text-error-on-dark" : "text-error-accent")}>
        {errors[k]}
      </span>
    ) : null;
  const described = (k: keyof Values) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  return (
    <form onSubmit={submit} noValidate className="grid flex-2 basis-md gap-4 sm:grid-cols-2">
      {sent && (
        <Notice tone="ok" role="status" className="sm:col-span-2">
          Your email app should open with everything filled in. Send it and I’ll reply within a day or two.
        </Notice>
      )}
      {Object.keys(errors).length > 0 && (
        <Notice tone="error" role="alert" className="sm:col-span-2">
          A few fields need a look before this can go out.
        </Notice>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-name" className={labelClass}>Full name *</label>
        <input id="f-name" value={v.name} onChange={set("name")} className={field("name")} autoComplete="name" {...described("name")} />
        {err("name")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-email" className={labelClass}>Email *</label>
        <input id="f-email" type="email" value={v.email} onChange={set("email")} className={field("email")} autoComplete="email" {...described("email")} />
        {err("email")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-tier" className={labelClass}>Bundle / tier *</label>
        <select id="f-tier" value={v.tier} onChange={set("tier")} className={field("tier")} {...described("tier")}>
          <option value="">Choose one</option>
          <optgroup label="Professional">{bundles.map((b) => <option key={b}>{b}</option>)}</optgroup>
          <optgroup label="Business">{businessBundles.map((b) => <option key={b}>{b}</option>)}</optgroup>
        </select>
        {err("tier")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-pay" className={labelClass}>Payment option *</label>
        <select id="f-pay" value={v.pay} onChange={set("pay")} className={field("pay")} {...described("pay")}>
          <option value="">Choose one</option>
          {paymentOptions.map((p) => <option key={p}>{p}</option>)}
        </select>
        {err("pay")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-company" className={labelClass}>Company</label>
        <input id="f-company" value={v.company} onChange={set("company")} className={field("company")} autoComplete="organization" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-time" className={labelClass}>Timeline *</label>
        <select id="f-time" value={v.time} onChange={set("time")} className={field("time")} {...described("time")}>
          <option value="">Choose one</option>
          {timelines.map((t) => <option key={t}>{t}</option>)}
        </select>
        {err("time")}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="f-details" className={labelClass}>Project details</label>
        <textarea id="f-details" rows={4} value={v.details} onChange={set("details")} className={cn(field("details"), "resize-y")} />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className={buttonClass("primary", undefined, dark)}>Send inquiry</button>
        <a href={`mailto:${email}`} className={buttonClass("tertiary", undefined, dark)}>Or email me directly</a>
      </div>
    </form>
  );
}
