import type { Minutes } from "./run-of-show";

/** The event runs on Copenhagen wall-clock time, wherever the laptop is. */
const EVENT_TIME_ZONE = "Europe/Copenhagen";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export interface EventClock {
  readonly minutes: Minutes;
  readonly seconds: number;
  readonly label: string;
  /** Calendar date at the venue, YYYY-MM-DD. */
  readonly date: string;
}

/** Wall-clock time at the venue, optionally shifted for rehearsal. */
export function eventClock(date: Date, offsetMinutes: Minutes = 0): EventClock {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  const parts = formatter.formatToParts(shifted);
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const h = read("hour");
  const m = read("minute");
  const s = read("second");
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    minutes: h * 60 + m,
    seconds: s,
    label: `${pad(h)}:${pad(m)}:${pad(s)}`,
    date: dateFormatter.format(shifted),
  };
}
