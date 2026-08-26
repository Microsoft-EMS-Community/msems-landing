"use client";

import { Minus, Play, Plus, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriftChip } from "@/components/stage/drift-chip";
import type { ActualField } from "@/components/stage/use-stage-state";
import type { AgendaKind } from "@/lib/event";
import {
  formatDelta,
  formatTime,
  parseTime,
  type Minutes,
  type ProjectedSegment,
} from "@/lib/run-of-show";

const KIND_LABEL: Record<AgendaKind, string> = {
  registration: "Doors",
  welcome: "Intro",
  sessions: "Talk",
  changeover: "Changeover",
  break: "Break",
  discussion: "CloudHour",
  social: "Networking",
  closing: "Closing",
};

const STATUS_STYLE: Record<ProjectedSegment["status"], string> = {
  done: "border-white/5 bg-white/[0.02] opacity-70",
  live: "border-brand-pink/50 bg-brand-pink/[0.07] shadow-lg shadow-brand-pink/10",
  next: "border-brand-teal/40 bg-brand-teal/[0.05]",
  upcoming: "border-white/10 bg-white/[0.03]",
};

const DURATION_STEP: Minutes = 5;

interface SegmentRowProps {
  readonly segment: ProjectedSegment;
  readonly now: Minutes;
  readonly onStart: (id: string) => void;
  readonly onEnd: (id: string) => void;
  readonly onSetActual: (
    id: string,
    field: ActualField,
    at: Minutes | undefined,
  ) => void;
  readonly onSetDuration: (id: string, minutes: Minutes | undefined) => void;
}

function TimeField({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: Minutes;
  readonly onChange: (at: Minutes) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="time"
        value={formatTime(value)}
        onChange={(e) => {
          const parsed = parseTime(e.target.value);
          if (parsed !== null) onChange(parsed);
        }}
        className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs tabular-nums text-foreground"
      />
    </label>
  );
}

function Outcome({ segment, now }: { readonly segment: ProjectedSegment; readonly now: Minutes }) {
  const planned = segment.plannedEnd - segment.plannedStart;
  if (segment.status === "done") {
    const endDelta = segment.end - segment.plannedEnd;
    return (
      <p className="text-sm text-muted-foreground">
        Ran {formatTime(segment.start)} to {formatTime(segment.end)} · ended{" "}
        {endDelta === 0
          ? "on time"
          : `${Math.abs(endDelta)} min ${endDelta > 0 ? "late" : "early"}`}
      </p>
    );
  }
  if (segment.status === "live") {
    const due = segment.start + segment.duration;
    const elapsed = Math.max(0, now - segment.start);
    const pct = Math.min(100, (elapsed / Math.max(1, segment.duration)) * 100);
    return (
      <div>
        <p className="text-sm">
          Started {formatTime(segment.start)} · due {formatTime(due)}
          {segment.duration !== planned && (
            <span className="text-muted-foreground"> (planned {planned} min)</span>
          )}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${now > due ? "bg-red-400" : "brand-gradient-bg"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm">
      <span>
        Projected {formatTime(segment.start)} to {formatTime(segment.end)}
      </span>
      <DriftChip delta={segment.drift} />
    </p>
  );
}

export function SegmentRow({
  segment,
  now,
  onStart,
  onEnd,
  onSetActual,
  onSetDuration,
}: SegmentRowProps) {
  const planned = segment.plannedEnd - segment.plannedStart;
  const overridden = segment.duration !== planned;

  return (
    <li
      className={`rounded-2xl border p-4 transition-colors ${STATUS_STYLE[segment.status]}`}
    >
      <div className="flex gap-4">
        <div className="w-24 shrink-0 text-sm tabular-nums">
          <div className="font-medium">
            {formatTime(segment.plannedStart)}
          </div>
          <div className="text-muted-foreground">
            {formatTime(segment.plannedEnd)}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            planned
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {segment.status === "live" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-pink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            )}
            {segment.status === "next" && (
              <span className="rounded-full border border-brand-teal/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-teal">
                Up next
              </span>
            )}
            <span className="font-semibold">{segment.title}</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
              {KIND_LABEL[segment.kind]}
            </span>
          </div>
          {segment.speaker && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {segment.speaker}
            </p>
          )}

          <div className="mt-2">
            <Outcome segment={segment} now={now} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {segment.status === "live" ? (
              <Button size="sm" variant="outline" onClick={() => onEnd(segment.id)}>
                <Square className="size-3.5" /> End now
              </Button>
            ) : segment.status === "done" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetActual(segment.id, "end", undefined)}
              >
                <RotateCcw className="size-3.5" /> Reopen
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onStart(segment.id)}>
                <Play className="size-3.5" /> Start now
              </Button>
            )}

            {segment.status !== "done" && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-1.5 py-0.5 text-xs">
                <button
                  type="button"
                  aria-label="Shorten by 5 minutes"
                  onClick={() =>
                    onSetDuration(segment.id, segment.duration - DURATION_STEP)
                  }
                  className="rounded p-0.5 hover:bg-white/10"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-14 text-center tabular-nums">
                  {segment.duration} min
                </span>
                <button
                  type="button"
                  aria-label="Extend by 5 minutes"
                  onClick={() =>
                    onSetDuration(segment.id, segment.duration + DURATION_STEP)
                  }
                  className="rounded p-0.5 hover:bg-white/10"
                >
                  <Plus className="size-3.5" />
                </button>
                {overridden && (
                  <button
                    type="button"
                    onClick={() => onSetDuration(segment.id, undefined)}
                    className="ml-1 text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    reset ({formatDelta(segment.duration - planned)})
                  </button>
                )}
              </span>
            )}

            {segment.status !== "next" && segment.status !== "upcoming" && (
              <TimeField
                label="Started"
                value={segment.start}
                onChange={(at) => onSetActual(segment.id, "start", at)}
              />
            )}
            {segment.status === "done" && (
              <TimeField
                label="Ended"
                value={segment.end}
                onChange={(at) => onSetActual(segment.id, "end", at)}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
