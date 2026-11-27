"use client";

import { useEffect, useState, useTransition } from "react";
import { submitInquiry } from "@/app/actions/inquiry";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { Notice } from "@/components/ui/Notice";
import { Confirmation } from "@/components/ui/Confirmation";

type Values = {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  problem: string;
  success: string;
  budget: string;
  time: string;
  tier: string;
  heard: string;
  build: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { name: "", email: "", company: "", role: "", website: "", problem: "", success: "", budget: "", time: "", tier: "", heard: "", build: "" };

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email, like you@company.com.";
  if (!v.company.trim()) e.company = "Please add your company or brand.";
  if (!v.problem.trim()) e.problem = "Tell me a little about what’s not working.";
  if (!v.budget) e.budget = "Pick the closest budget range.";
  if (!v.time) e.time = "Pick a timeline.";
  return e;
}

export function InquiryForm({
  email,
  bundles,
  businessBundles,
  budgets,
  timelines,
  dark = false,
}: {
  email: string;
  bundles: string[];
  businessBundles: string[];
  budgets: string[];
  timelines: string[];
  dark?: boolean;
}) {
  const [v, setV] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<null | "saved" | "email">(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onChoose = (e: Event) => setV((prev) => ({ ...prev, tier: (e as CustomEvent<string>).detail }));
    // From "Build your own bundle": the picks and the estimate arrive as a ready-made summary
    const onBuild = (e: Event) => setV((prev) => ({ ...prev, tier: "Custom bundle", build: (e as CustomEvent<string>).detail }));
    window.addEventListener("choose-bundle", onChoose);
    window.addEventListener("custom-bundle", onBuild);
    return () => {
      window.removeEventListener("choose-bundle", onChoose);
      window.removeEventListener("custom-bundle", onBuild);
    };
  }, []);

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    setSent(null);
    if (tried) setErrors(validate(next));
  };

  const field = (k: keyof Values) =>
    cn(
      "min-h-10 w-full rounded-lg px-3 py-2 text-sm transition",
      // On black: frosted glass, so the glow behind the page shows through, blurred.
      // Native dropdown options keep a solid black background (**:bg-ink).
      dark ? "bg-paper/5 text-paper backdrop-blur-md placeholder:text-paper/40 **:bg-ink" : "bg-paper text-ink",
      errors[k]
        ? dark
          ? "border-2 border-error-on-dark"
          : "border-2 border-error-accent"
        : dark
          ? "border border-paper/30 focus:border-paper focus:ring-1 focus:ring-paper focus:outline-none"
          : "border border-field focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none",
    );

  const labelClass = cn("text-sm font-medium", dark && "text-paper/80");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(v);
    setTried(true);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const values = v;
    startTransition(async () => {
      const res = await submitInquiry({
        source: "project",
        name: values.name,
        email: values.email,
        company: values.company,
        role: values.role,
        website: values.website,
        problem: values.problem,
        success: values.success,
        budget: values.budget,
        tier: values.tier || "Help me choose",
        timeline: values.time,
        heard: values.heard,
        build: values.build,
        businessBundles,
      });
      if (!res.ok) {
        // Couldn't save it: fall back to the visitor's email app so the request still gets through
        const body = [
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Company: ${values.company}`,
          `Role: ${values.role || "—"}`,
          `Website: ${values.website || "—"}`,
          `Budget: ${values.budget}`,
          `Timeline: ${values.time}`,
          `Bundle: ${values.tier || "Help me choose"}`,
          `Heard about me: ${values.heard || "—"}`,
          "",
          `What's not working: ${values.problem}`,
          `Success in 6 months: ${values.success || "—"}`,
          ...(values.build ? ["", values.build] : []),
        ].join("\n");
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Project inquiry: ${values.company}`)}&body=${encodeURIComponent(body)}`;
      }
      setSent(res.ok ? "saved" : "email");
      setTried(false);
      setV(empty);
    });
  };

  const err = (k: keyof Values) =>
    errors[k] ? (
      <span id={`${k}-err`} className={cn("text-sm", dark ? "text-error-on-dark" : "text-error-accent")}>
        {errors[k]}
      </span>
    ) : null;
  const described = (k: keyof Values) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-err` } : {});

  return (
    <>
    <Confirmation
      open={sent !== null}
      onClose={() => setSent(null)}
      dark={dark}
      title={sent === "email" ? "Your project request is ready" : "Project request sent"}
      steps={[
        sent === "email" ? "Send the email that just opened in your email app." : "Your request is with me now.",
        "I’ll reply within 1 business day with a link to book your discovery call.",
        "We meet on a 45-minute call, then I send a written proposal.",
      ]}
    />
    <form onSubmit={submit} noValidate className="grid flex-2 basis-md gap-4 sm:grid-cols-2">
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
        <label htmlFor="f-email" className={labelClass}>Work email *</label>
        <input id="f-email" type="email" value={v.email} onChange={set("email")} className={field("email")} autoComplete="email" {...described("email")} />
        {err("email")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-company" className={labelClass}>Company or brand *</label>
        <input id="f-company" value={v.company} onChange={set("company")} className={field("company")} autoComplete="organization" {...described("company")} />
        {err("company")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-role" className={labelClass}>Your role</label>
        <input id="f-role" value={v.role} onChange={set("role")} className={field("role")} autoComplete="organization-title" placeholder="e.g. Owner, Marketing lead" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="f-website" className={labelClass}>Current website</label>
        <input id="f-website" type="url" value={v.website} onChange={set("website")} className={field("website")} autoComplete="url" placeholder="Leave blank if you don’t have one yet" />
      </div>
      {v.build && (
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="f-build" className={labelClass}>Your custom bundle</label>
          <textarea id="f-build" rows={8} value={v.build} onChange={set("build")} className={cn(field("build"), "resize-y font-mono text-xs")} />
        </div>
      )}
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="f-problem" className={labelClass}>What’s not working right now? *</label>
        <textarea id="f-problem" rows={4} value={v.problem} onChange={set("problem")} className={cn(field("problem"), "resize-y")} placeholder="e.g. People visit but don’t book." {...described("problem")} />
        {err("problem")}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="f-success" className={labelClass}>What would success look like 6 months after launch?</label>
        <textarea id="f-success" rows={3} value={v.success} onChange={set("success")} className={cn(field("success"), "resize-y")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-budget" className={labelClass}>Budget range *</label>
        <select id="f-budget" value={v.budget} onChange={set("budget")} className={field("budget")} {...described("budget")}>
          <option value="">Choose one</option>
          {budgets.map((b) => <option key={b}>{b}</option>)}
        </select>
        {err("budget")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-time" className={labelClass}>Timeline *</label>
        <select id="f-time" value={v.time} onChange={set("time")} className={field("time")} {...described("time")}>
          <option value="">Choose one</option>
          {timelines.map((t) => <option key={t}>{t}</option>)}
        </select>
        {err("time")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-tier" className={labelClass}>Bundle</label>
        <select id="f-tier" value={v.tier} onChange={set("tier")} className={field("tier")}>
          <option value="">Help me choose</option>
          <option>Custom bundle</option>
          <optgroup label="For business">{businessBundles.map((b) => <option key={b}>{b}</option>)}</optgroup>
          <optgroup label="For personal">{bundles.map((b) => <option key={b}>{b}</option>)}</optgroup>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="f-heard" className={labelClass}>How did you hear about me?</label>
        <input id="f-heard" value={v.heard} onChange={set("heard")} className={field("heard")} />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", undefined, dark)}>{pending ? "Sending…" : "Send"}</button>
        <a href={`mailto:${email}`} className={buttonClass("tertiary", undefined, dark)}>Or email me directly</a>
      </div>
    </form>
    </>
  );
}
