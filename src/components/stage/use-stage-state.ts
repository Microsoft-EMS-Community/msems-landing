"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  EMPTY_STATE,
  type Minutes,
  type StageState,
  type Trim,
} from "@/lib/run-of-show";

const STORAGE_KEY = "msems-stage-v1";

export type ActualField = "start" | "end";

export interface StageActions {
  /** Start `id` now, closing any still-open segments at the same moment. */
  readonly startSegment: (
    id: string,
    at: Minutes,
    closeIds: readonly string[],
  ) => void;
  readonly endSegment: (id: string, at: Minutes) => void;
  /** Correct a recorded time; `undefined` clears it (reopens the segment). */
  readonly setActual: (
    id: string,
    field: ActualField,
    at: Minutes | undefined,
  ) => void;
  readonly setDuration: (id: string, minutes: Minutes | undefined) => void;
  readonly applyTrims: (trims: readonly Trim[]) => void;
  readonly setClockOffset: (minutes: Minutes) => void;
  readonly reset: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Keep only finite numeric entries; anything odd in storage is dropped. */
function numberMap(value: unknown): Record<string, Minutes> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

export function parseState(raw: unknown): StageState | null {
  if (!isRecord(raw)) return null;
  const offset = raw.clockOffset;
  return {
    actualStart: numberMap(raw.actualStart),
    actualEnd: numberMap(raw.actualEnd),
    durations: numberMap(raw.durations),
    clockOffset:
      typeof offset === "number" && Number.isFinite(offset) ? offset : 0,
  };
}

function load(): StageState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return (raw ? parseState(JSON.parse(raw)) : null) ?? EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function save(state: StageState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the page still works for this visit.
  }
}

/*
 * A tiny external store: the in-memory copy is the truth, localStorage is
 * the mirror that survives a reload or a closed lid.
 */
let cache: StageState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): StageState {
  cache ??= load();
  return cache;
}

function getServerSnapshot(): StageState {
  return EMPTY_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(change: (prev: StageState) => StageState): void {
  cache = change(getSnapshot());
  save(cache);
  listeners.forEach((listener) => listener());
}

/** Forget everything, in memory and on disk. */
function clear(): void {
  cache = EMPTY_STATE;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to remove, or storage is unavailable: memory is already clean.
  }
  listeners.forEach((listener) => listener());
}

function without<T>(map: Readonly<Record<string, T>>, id: string) {
  return Object.fromEntries(
    Object.entries(map).filter(([key]) => key !== id),
  );
}

const ACTIONS: StageActions = {
  startSegment: (id, at, closeIds) =>
    update((prev) => ({
      ...prev,
      actualStart: { ...prev.actualStart, [id]: at },
      actualEnd: {
        ...prev.actualEnd,
        ...Object.fromEntries(closeIds.map((closeId) => [closeId, at])),
      },
    })),

  endSegment: (id, at) =>
    update((prev) => ({
      ...prev,
      actualEnd: { ...prev.actualEnd, [id]: at },
    })),

  setActual: (id, field, at) =>
    update((prev) => {
      const key = field === "start" ? "actualStart" : "actualEnd";
      const next =
        at === undefined ? without(prev[key], id) : { ...prev[key], [id]: at };
      return { ...prev, [key]: next };
    }),

  setDuration: (id, minutes) =>
    update((prev) => ({
      ...prev,
      durations:
        minutes === undefined
          ? without(prev.durations, id)
          : { ...prev.durations, [id]: Math.max(0, minutes) },
    })),

  applyTrims: (trims) =>
    update((prev) => ({
      ...prev,
      durations: {
        ...prev.durations,
        ...Object.fromEntries(trims.map((t) => [t.id, t.to])),
      },
    })),

  setClockOffset: (minutes) =>
    update((prev) => ({ ...prev, clockOffset: minutes })),

  reset: clear,
};

/** The day's recorded times, persisted in this browser. */
export function useStageState(): readonly [StageState, StageActions] {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => [state, ACTIONS] as const, [state]);
}
