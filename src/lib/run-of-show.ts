import type { AgendaItem, AgendaKind } from "./event";

/** Minutes since midnight, in the event's wall-clock time. */
export type Minutes = number;

export interface Segment {
  readonly id: string;
  readonly title: string;
  readonly kind: AgendaKind;
  readonly speaker?: string;
  readonly plannedStart: Minutes;
  readonly plannedEnd: Minutes;
  /** Can be shortened to claw back time (breaks, changeovers, networking). */
  readonly flexible: boolean;
  /** Shortest sensible length when trimming a flexible segment. */
  readonly minDuration: Minutes;
}

/** What the team records on the day. Everything else is derived. */
export interface StageState {
  readonly actualStart: Readonly<Record<string, Minutes>>;
  readonly actualEnd: Readonly<Record<string, Minutes>>;
  /** Duration overrides in minutes (e.g. a trimmed coffee break). */
  readonly durations: Readonly<Record<string, Minutes>>;
  /** Rehearsal only: minutes added to the real clock. 0 means live. */
  readonly clockOffset: Minutes;
}

export const EMPTY_STATE: StageState = {
  actualStart: {},
  actualEnd: {},
  durations: {},
  clockOffset: 0,
};

export type SegmentStatus = "done" | "live" | "next" | "upcoming";

export interface ProjectedSegment extends Segment {
  /** Planned length, or the team's override. */
  readonly duration: Minutes;
  /** Actual start when recorded, otherwise the projected one. */
  readonly start: Minutes;
  /** Actual end when recorded, otherwise the projected one. */
  readonly end: Minutes;
  readonly status: SegmentStatus;
  /** start minus plannedStart: positive means behind schedule. */
  readonly drift: Minutes;
  /** Live only: minutes until the allotted time is up (negative = over). */
  readonly remaining?: Minutes;
}

export interface Projection {
  readonly segments: readonly ProjectedSegment[];
  readonly live?: ProjectedSegment;
  readonly next?: ProjectedSegment;
  /** How far behind (+) or ahead (-) the rest of the day currently runs. */
  readonly drift: Minutes;
  /**
   * Spare minutes before the next planned start: the gap between now (or the
   * live segment's due time) and when the next one is scheduled. Time you can
   * hand to Q&A or a longer break without pushing anything.
   */
  readonly slack: Minutes;
  readonly plannedEndOfDay: Minutes;
  readonly projectedEndOfDay: Minutes;
  /** True once anything has been started: the clock then floors projections. */
  readonly underway: boolean;
}

export interface Consequence {
  readonly id: string;
  readonly title: string;
  readonly planned: Minutes;
  readonly projected: Minutes;
  readonly delta: Minutes;
}

export interface Trim {
  readonly id: string;
  readonly title: string;
  readonly from: Minutes;
  readonly to: Minutes;
  readonly cut: Minutes;
}

export interface RecoveryPlan {
  readonly need: Minutes;
  readonly recovered: Minutes;
  readonly shortfall: Minutes;
  readonly trims: readonly Trim[];
}

/** Floor lengths for segments that may be trimmed, by kind. */
const FLEX_FLOOR: Partial<Record<AgendaKind, Minutes>> = {
  break: 10,
  changeover: 0,
  social: 0,
};

const DEFAULT_DURATION: Minutes = 30;

export function parseTime(hhmm: string): Minutes | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatTime(minutes: Minutes): string {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60) % 24;
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDrift(delta: Minutes): string {
  if (delta === 0) return "on time";
  const n = Math.abs(delta);
  return delta > 0 ? `${n} min behind` : `${n} min ahead`;
}

export function formatDelta(delta: Minutes): string {
  if (delta === 0) return "±0";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * Turn the public agenda into one continuous chain of timed segments. The
 * optional evening add-on is dropped; missing or overlapping end times are
 * clamped to the next start so the day never double-books itself.
 */
export function buildSegments(items: readonly AgendaItem[]): Segment[] {
  const timed = items
    .filter((item) => !item.optional)
    .flatMap((item) => {
      const start = parseTime(item.time);
      return start === null ? [] : [{ item, start }];
    })
    .sort((a, b) => a.start - b.start);

  return timed.map(({ item, start }, i) => {
    const nextStart = timed[i + 1]?.start;
    const rawEnd = item.endTime ? parseTime(item.endTime) : null;
    const wanted = rawEnd ?? nextStart ?? start + DEFAULT_DURATION;
    const clamped =
      nextStart === undefined ? wanted : Math.min(wanted, nextStart);
    const plannedEnd = Math.max(clamped, start);
    const floor = FLEX_FLOOR[item.kind];
    const flexible = floor !== undefined;
    return {
      id: `${formatTime(start)}-${slug(item.title)}`,
      title: item.title,
      kind: item.kind,
      speaker: item.speakers?.map((s) => s.name).join(", ") || undefined,
      plannedStart: start,
      plannedEnd,
      flexible,
      minDuration: flexible
        ? Math.min(floor, plannedEnd - start)
        : plannedEnd - start,
    };
  });
}

/**
 * Lay the day out against what has actually happened. Recorded times win;
 * everything after them is pushed (never pulled earlier than planned).
 */
export function project(
  segments: readonly Segment[],
  state: StageState,
  now: Minutes,
): Projection {
  const underway = Object.keys(state.actualStart).length > 0;
  let prevEnd: Minutes | undefined;
  let nextAssigned = false;

  const projected = segments.map((seg): ProjectedSegment => {
    const duration =
      state.durations[seg.id] ?? seg.plannedEnd - seg.plannedStart;
    const actualStart = state.actualStart[seg.id];
    const actualEnd = state.actualEnd[seg.id];
    const chainStart = Math.max(prevEnd ?? seg.plannedStart, seg.plannedStart);
    const start =
      actualStart ?? (underway ? Math.max(chainStart, now) : chainStart);

    let status: SegmentStatus;
    let end: Minutes;
    let remaining: Minutes | undefined;
    if (actualEnd !== undefined) {
      status = "done";
      end = Math.max(actualEnd, start);
    } else if (actualStart !== undefined) {
      status = "live";
      const due = actualStart + duration;
      end = Math.max(due, now);
      remaining = due - now;
    } else {
      status = nextAssigned ? "upcoming" : "next";
      nextAssigned = true;
      end = start + duration;
    }
    prevEnd = end;
    return {
      ...seg,
      duration,
      start,
      end,
      status,
      drift: start - seg.plannedStart,
      remaining,
    };
  });

  const live = projected.filter((s) => s.status === "live").at(-1);
  const next = projected.find((s) => s.status === "next");
  const last = projected.at(-1);
  const drift = next ? next.drift : live ? live.end - live.plannedEnd : 0;
  const slack = !next
    ? 0
    : live
      ? Math.max(0, next.plannedStart - live.end)
      : underway
        ? Math.max(0, next.plannedStart - now)
        : 0;

  return {
    segments: projected,
    live,
    next,
    drift,
    slack,
    plannedEndOfDay: last?.plannedEnd ?? 0,
    projectedEndOfDay: last?.end ?? 0,
    underway,
  };
}

/** Everything still ahead whose time moved, plus the end of the day. */
export function consequences(p: Projection): Consequence[] {
  const moved = p.segments
    .filter(
      (s) => s.status !== "done" && s.status !== "live" && s.drift !== 0,
    )
    .map((s) => ({
      id: s.id,
      title: s.title,
      planned: s.plannedStart,
      projected: s.start,
      delta: s.drift,
    }));
  const endDelta = p.projectedEndOfDay - p.plannedEndOfDay;
  if (endDelta === 0) return moved;
  return [
    ...moved,
    {
      id: "end-of-day",
      title: "End of day",
      planned: p.plannedEndOfDay,
      projected: p.projectedEndOfDay,
      delta: endDelta,
    },
  ];
}

/**
 * How to get back on time: spread the delay across the remaining flexible
 * segments in proportion to how much slack each one has.
 */
export function recoveryPlan(p: Projection): RecoveryPlan | null {
  if (p.drift <= 0) return null;
  const candidates = p.segments.filter(
    (s) => s.flexible && (s.status === "next" || s.status === "upcoming"),
  );
  const slack = candidates.map((s) => Math.max(0, s.duration - s.minDuration));
  const total = slack.reduce((a, b) => a + b, 0);
  const need = p.drift;

  const { trims, left } = candidates.reduce<{
    trims: Trim[];
    left: Minutes;
  }>(
    (acc, s, i) => {
      const share = total > 0 ? Math.ceil((need * slack[i]) / total) : 0;
      const cut = Math.min(share, slack[i], acc.left);
      if (cut <= 0) return acc;
      return {
        trims: [
          ...acc.trims,
          {
            id: s.id,
            title: s.title,
            from: s.duration,
            to: s.duration - cut,
            cut,
          },
        ],
        left: acc.left - cut,
      };
    },
    { trims: [], left: need },
  );

  return { need, recovered: need - left, shortfall: left, trims };
}
