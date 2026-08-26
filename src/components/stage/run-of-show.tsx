"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Consequences } from "@/components/stage/consequences";
import { ResetButton } from "@/components/stage/reset-button";
import { DriftChip } from "@/components/stage/drift-chip";
import { SegmentRow } from "@/components/stage/segment-row";
import { useEventClock } from "@/components/stage/use-event-clock";
import { useStageState } from "@/components/stage/use-stage-state";
import { EVENT } from "@/lib/event";
import { eventClock } from "@/lib/stage-clock";
import {
  formatTime,
  parseTime,
  project,
  type Minutes,
  type ProjectedSegment,
  type Segment,
} from "@/lib/run-of-show";

interface RunOfShowProps {
  readonly segments: readonly Segment[];
}

/** The event's calendar date and the window in which the real clock makes sense. */
const EVENT_DAY = EVENT.startsAtISO.slice(0, 10);
const DOORS_MINUS_MARGIN: Minutes = 8 * 60;
const CLOSE_PLUS_MARGIN: Minutes = 17 * 60 + 30;
/** Where a rehearsal starts: five minutes before doors. */
const REHEARSAL_START: Minutes = 8 * 60 + 25;

function OffHoursNotice({
  label,
  onRehearse,
}: {
  readonly label: string;
  readonly onRehearse: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
      <p>
        <span className="font-semibold text-amber-300">
          It is {label} in Copenhagen, outside event hours.
        </span>{" "}
        Anything you start now counts as hours late. Testing? Use the
        rehearsal clock instead.
      </p>
      <Button size="sm" variant="outline" onClick={onRehearse}>
        Rehearse from {formatTime(REHEARSAL_START)}
      </Button>
    </div>
  );
}

function signedClock(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const mm = String(Math.floor(abs / 60)).padStart(2, "0");
  const ss = String(abs % 60).padStart(2, "0");
  return `${totalSeconds < 0 ? "-" : ""}${mm}:${ss}`;
}

function LiveHero({
  live,
  nowSeconds,
}: {
  readonly live: ProjectedSegment;
  readonly nowSeconds: number;
}) {
  const dueSeconds = (live.start + live.duration) * 60;
  const left = dueSeconds - nowSeconds;
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-pink">
        Live now
      </p>
      <h2 className="mt-1 text-balance text-2xl font-bold sm:text-3xl">
        {live.title}
      </h2>
      {live.speaker && (
        <p className="mt-1 text-muted-foreground">{live.speaker}</p>
      )}
      <p
        className={`mt-5 text-6xl font-bold tabular-nums tracking-tight sm:text-7xl ${
          left < 0 ? "text-red-400" : left < 5 * 60 ? "text-amber-300" : ""
        }`}
      >
        {signedClock(left)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {left < 0 ? "over the allotted time" : "left of the allotted time"} ·
        due {formatTime(live.start + live.duration)}
      </p>
    </>
  );
}

function NextHero({
  next,
  now,
}: {
  readonly next: ProjectedSegment;
  readonly now: Minutes;
}) {
  const until = next.plannedStart - now;
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
        Up next
      </p>
      <h2 className="mt-1 text-balance text-2xl font-bold sm:text-3xl">
        {next.title}
      </h2>
      {next.speaker && (
        <p className="mt-1 text-muted-foreground">{next.speaker}</p>
      )}
      <p className="mt-5 text-4xl font-bold tabular-nums tracking-tight">
        {formatTime(next.plannedStart)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {until > 0
          ? `planned start, in ${until} min`
          : until === 0
            ? "planned start, now"
            : `planned start, ${Math.abs(until)} min ago`}
      </p>
    </>
  );
}

function SlackNote({
  slack,
  live,
  next,
}: {
  readonly slack: Minutes;
  readonly live?: ProjectedSegment;
  readonly next: ProjectedSegment;
}) {
  if (slack <= 0) return null;
  return (
    <p className="max-w-md text-balance text-sm text-sky-300">
      {live
        ? `If this ends on time there is a ${slack} min buffer before ${next.title} at ${formatTime(next.plannedStart)}.`
        : `You have ${slack} min spare: ${next.title} is not due until ${formatTime(next.plannedStart)}. Take questions, stretch the break, or start early.`}
    </p>
  );
}

function StaleRehearsalNotice({ onFix }: { readonly onFix: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/50 bg-red-400/10 p-4 text-sm">
      <p>
        <span className="font-semibold text-red-300">
          It is event day but the rehearsal clock is still on.
        </span>{" "}
        Every time on this page is shifted. Switch back before you start.
      </p>
      <Button
        size="sm"
        className="brand-gradient-bg border-0 text-white hover:opacity-90"
        onClick={onFix}
      >
        Back to real time
      </Button>
    </div>
  );
}

function RehearsalClock({
  offset,
  realNow,
  onChange,
}: {
  readonly offset: Minutes;
  readonly realNow: Minutes;
  readonly onChange: (offset: Minutes) => void;
}) {
  const [target, setTarget] = useState("09:20");
  return (
    <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
      <summary className="cursor-pointer font-medium">
        Rehearsal clock{offset !== 0 && " (active)"}
      </summary>
      <p className="mt-2 text-muted-foreground">
        Pretend it is a given time to dry-run the day. Nothing here touches the
        public site.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          type="time"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-md border border-white/15 bg-white/5 px-2 py-1 tabular-nums"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const wanted = parseTime(target);
            if (wanted !== null) onChange(wanted - realNow);
          }}
        >
          Jump to this time
        </Button>
        {offset !== 0 && (
          <Button size="sm" variant="outline" onClick={() => onChange(0)}>
            Back to real time
          </Button>
        )}
      </div>
    </details>
  );
}

export function RunOfShow({ segments }: RunOfShowProps) {
  const [state, actions] = useStageState();
  const clock = useEventClock(state.clockOffset);
  const now = clock.minutes;
  const nowSeconds = now * 60 + clock.seconds;
  const real = eventClock(new Date());
  const realNow = real.minutes;
  const staleRehearsal = state.clockOffset !== 0 && real.date === EVENT_DAY;

  const projection = useMemo(
    () => project(segments, state, now),
    [segments, state, now],
  );
  const { live, next } = projection;

  const advance = () => {
    if (next) actions.startSegment(next.id, now, live ? [live.id] : []);
    else if (live) actions.endSegment(live.id, now);
  };

  const offHours =
    state.clockOffset === 0 &&
    (clock.date !== EVENT_DAY ||
      now < DOORS_MINUS_MARGIN ||
      now > CLOSE_PLUS_MARGIN);
  const rehearse = () => {
    actions.reset();
    actions.setClockOffset(REHEARSAL_START - realNow);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <header className="sticky top-0 z-40 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> {EVENT.shortName}
          </Link>
          <h1 className="text-lg font-bold">Run of show</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{clock.label}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {state.clockOffset !== 0 ? (
                <span className="text-amber-300">Rehearsal clock</span>
              ) : (
                "Copenhagen time"
              )}
            </p>
          </div>
          <ResetButton onReset={actions.reset} />
        </div>
      </header>

      {offHours && (
        <OffHoursNotice label={clock.label.slice(0, 5)} onRehearse={rehearse} />
      )}
      {staleRehearsal && (
        <StaleRehearsalNotice onFix={() => actions.setClockOffset(0)} />
      )}

      <section className="rounded-3xl border border-white/10 bg-background/60 p-6 text-center shadow-2xl shadow-black/40 sm:p-8">
        {live ? (
          <LiveHero live={live} nowSeconds={nowSeconds} />
        ) : next ? (
          <NextHero next={next} now={now} />
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Done
            </p>
            <h2 className="mt-1 text-2xl font-bold">That&apos;s a wrap</h2>
          </>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {(next || live) && (
            <Button
              size="lg"
              onClick={advance}
              className="sheen brand-gradient-bg h-14 w-full max-w-md border-0 text-base text-white hover:opacity-90"
            >
              {next ? (
                <>
                  <Play className="size-5 shrink-0" />
                  <span className="min-w-0 truncate">Start: {next.title}</span>
                </>
              ) : (
                <>
                  <Square className="size-5" /> End the day
                </>
              )}
            </Button>
          )}
          <DriftChip delta={projection.drift} size="lg" />
          {next && (
            <SlackNote slack={projection.slack} live={live} next={next} />
          )}
        </div>
      </section>

      <div className="mt-6">
        <Consequences projection={projection} onApply={actions.applyTrims} />
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <p className="text-xs text-muted-foreground">
          Planned {formatTime(projection.plannedEndOfDay)} finish · projected{" "}
          {formatTime(projection.projectedEndOfDay)}
        </p>
      </div>
      <ul className="mt-3 space-y-3">
        {projection.segments.map((segment) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            now={now}
            onStart={(id) =>
              actions.startSegment(id, now, live ? [live.id] : [])
            }
            onEnd={(id) => actions.endSegment(id, now)}
            onSetActual={actions.setActual}
            onSetDuration={actions.setDuration}
          />
        ))}
      </ul>

      <div className="mt-10 space-y-4">
        <RehearsalClock
          offset={state.clockOffset}
          realNow={realNow}
          onChange={actions.setClockOffset}
        />
        <p className="text-xs text-muted-foreground">
          Times are saved in this browser only. Whoever runs the day keeps this
          tab open. Reset all (top right) clears everything, including the
          rehearsal clock.
        </p>
      </div>
    </div>
  );
}
