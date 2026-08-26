"use client";

import { ArrowRight, Scissors, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriftChip, driftTone } from "@/components/stage/drift-chip";
import {
  consequences,
  formatDelta,
  formatTime,
  recoveryPlan,
  type Projection,
  type Trim,
} from "@/lib/run-of-show";

interface ConsequencesProps {
  readonly projection: Projection;
  readonly onApply: (trims: readonly Trim[]) => void;
}

/**
 * "What does being late actually cost us?" Lists every upcoming time that
 * moved, then a concrete plan to claw the minutes back from the breaks.
 */
export function Consequences({ projection, onApply }: ConsequencesProps) {
  const moved = consequences(projection);
  const plan = recoveryPlan(projection);
  const overrunning =
    projection.live !== undefined &&
    projection.live.remaining !== undefined &&
    projection.live.remaining < 0;

  if (moved.length === 0 && !overrunning) {
    return (
      <section className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-5">
        <h2 className="font-semibold text-emerald-300">
          Everything downstream is on time
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Lunch, coffee, CloudHour and the {formatTime(projection.plannedEndOfDay)}{" "}
          finish all hold.
          {projection.slack > 0 && projection.next
            ? ` You even have ${projection.slack} min to spare before ${projection.next.title}.`
            : " Keep going."}
        </p>
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border p-5 ${driftTone(projection.drift).replace(/text-[a-z]+-300/, "")}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-semibold">
          <TriangleAlert className="size-4" />
          Consequences
        </h2>
        <DriftChip delta={projection.drift} />
      </div>

      {overrunning && projection.live && (
        <p className="mt-3 text-sm">
          <span className="font-medium">{projection.live.title}</span> is over
          its allotted time by{" "}
          <span className="font-semibold text-red-300">
            {Math.abs(projection.live.remaining ?? 0)} min
          </span>{" "}
          and still counting: every minute now pushes the whole afternoon.
        </p>
      )}

      {moved.length > 0 && (
        <ul className="mt-4 divide-y divide-white/10 text-sm">
          {moved.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className={c.id === "end-of-day" ? "font-semibold" : ""}>
                {c.title}
              </span>
              <span className="inline-flex items-center gap-2 tabular-nums">
                <span className="text-muted-foreground line-through">
                  {formatTime(c.planned)}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="font-medium">{formatTime(c.projected)}</span>
                <span
                  className={`rounded-full border px-1.5 text-xs ${driftTone(c.delta)}`}
                >
                  {formatDelta(c.delta)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {plan && plan.trims.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-background/40 p-4">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <Scissors className="size-4" />
            To finish on time, trim {plan.recovered} min from the breaks
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {plan.trims.map((t) => (
              <li key={t.id} className="flex justify-between gap-3 tabular-nums">
                <span>{t.title}</span>
                <span>
                  {t.from} → {t.to} min{" "}
                  <span className="text-foreground">(-{t.cut})</span>
                </span>
              </li>
            ))}
          </ul>
          {plan.shortfall > 0 && (
            <p className="mt-2 text-sm text-red-300">
              Even then you are still {plan.shortfall} min over: the day ends
              around {formatTime(projection.plannedEndOfDay + plan.shortfall)}
              . Ask a speaker to tighten up, or accept the later finish.
            </p>
          )}
          <Button
            size="sm"
            className="mt-3 brand-gradient-bg border-0 text-white hover:opacity-90"
            onClick={() => onApply(plan.trims)}
          >
            Apply this plan
          </Button>
        </div>
      )}

      {plan && plan.trims.length === 0 && (
        <p className="mt-4 text-sm text-red-300">
          No breaks left to trim: the only way back is a shorter segment. The
          day ends around {formatTime(projection.projectedEndOfDay)}.
        </p>
      )}
    </section>
  );
}
