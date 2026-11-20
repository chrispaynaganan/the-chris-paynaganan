/** A slow, endless ticker. Pauses on hover. */
export function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className="flex shrink-0">
      {items.map((t) => (
        <span key={t} className="flex shrink-0 items-center gap-10 pr-10">
          <span className="text-3xl md:text-4xl">{t}</span>
          <span aria-hidden className="size-1.5 rounded-full bg-paper/40" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="group overflow-hidden border-y border-paper/15 py-6">
      <p className="sr-only">{items.join(", ")}</p>
      <div aria-hidden className="flex w-max animate-marquee group-hover:paused">
        {row}
        {row}
      </div>
    </div>
  );
}
