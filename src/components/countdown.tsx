"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** Target date as an ISO 8601 string. */
  targetISO: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

const UNITS: ReadonlyArray<{ key: keyof TimeLeft; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export function Countdown({ targetISO }: CountdownProps) {
  const target = new Date(targetISO).getTime();
  // Start null to avoid a hydration mismatch; fill in after mount.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Seed after mount (server renders placeholders) to avoid a hydration
    // mismatch, then tick every second.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {UNITS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center backdrop-blur-sm sm:px-4 sm:py-4"
        >
          <div className="font-mono text-2xl font-bold tabular-nums sm:text-4xl">
            {timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs sm:tracking-widest">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
