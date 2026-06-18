import { Ticket } from "lucide-react";
import { PRICING, allInPrice } from "@/lib/event";

// A ticket-styled visual of where a ticket goes, to show the event runs at
// cost. Percentages are an approximate split, not exact accounting.
const SLICES: ReadonlyArray<{ label: string; pct: number; color: string }> = [
  { label: "Lunch", pct: 35, color: "#ff2e88" },
  { label: "Coffee, tea & water", pct: 38, color: "#a855f7" },
  { label: "Drinks", pct: 13, color: "#22d3ee" },
  { label: "Ticketing fees", pct: 7, color: "#64748b" },
  { label: "Snacks, fruit & extras", pct: 7, color: "#f59e0b" },
];

export function TicketBreakdown() {
  const price = `${PRICING.currency}${allInPrice(PRICING.tiers[0].price)}`;

  return (
    <div className="relative mx-auto mt-12 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      {/* Ticket head */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl brand-gradient-bg">
            <Ticket className="size-5 text-white" />
          </span>
          <div>
            <p className="font-bold leading-tight">Your ticket</p>
            <p className="text-xs text-muted-foreground">
              Run at cost, here&apos;s where it goes
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tracking-tight">{price}</p>
          <p className="text-[11px] text-muted-foreground">early bird, all in</p>
        </div>
      </div>

      {/* Perforated tear (the ticket notches) */}
      <div className="relative -mx-6 my-6 sm:-mx-8">
        <div className="border-t border-dashed border-white/15" />
        <span className="absolute left-0 top-0 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute right-0 top-0 size-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-background" />
      </div>

      {/* The split */}
      <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full">
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
        Microsoft kindly provides the venue. Anything left over goes back into
        the day, like extra snacks and fruit, never profit.
      </p>
    </div>
  );
}
