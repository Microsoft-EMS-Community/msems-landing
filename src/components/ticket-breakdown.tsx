// A simple visual of where a ticket goes, to show the event is run at cost.
// Percentages are an approximate split, not exact accounting.
const SLICES: ReadonlyArray<{ label: string; pct: number; color: string }> = [
  { label: "Lunch", pct: 35, color: "#ff2e88" },
  { label: "Coffee, tea & water", pct: 38, color: "#a855f7" },
  { label: "Drinks", pct: 13, color: "#22d3ee" },
  { label: "Ticketing fees", pct: 7, color: "#64748b" },
  { label: "Snacks, fruit & extras", pct: 7, color: "#f59e0b" },
];

export function TicketBreakdown() {
  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h3 className="text-lg font-bold tracking-tight">Where your ticket goes</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Priced to cover costs, not for profit. Microsoft kindly provides the
        venue; your ticket covers the rest. Here&apos;s the rough split:
      </p>

      <div className="mt-5 flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
        {SLICES.map((s) => (
          <div
            key={s.label}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {SLICES.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground/80">
              {s.pct}%
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-muted-foreground">
        Anything left over goes back into the day, like extra snacks and fruit,
        never profit.
      </p>
    </div>
  );
}
