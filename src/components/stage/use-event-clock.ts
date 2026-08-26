"use client";

import { useEffect, useState } from "react";
import { eventClock, type EventClock } from "@/lib/stage-clock";
import type { Minutes } from "@/lib/run-of-show";

/** Ticks once a second in the venue's time zone (shifted while rehearsing). */
export function useEventClock(offsetMinutes: Minutes): EventClock {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setDate(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return eventClock(date, offsetMinutes);
}
