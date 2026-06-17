"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface Score {
  name: string;
  moves: number;
}

/**
 * Compact top-3 of the memory-game leaderboard. Renders nothing until there
 * are scores, so it stays out of the way when the board is empty.
 */
export function LeaderboardPreview() {
  const [board, setBoard] = useState<Score[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/score", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { scores?: Score[] }) => {
        if (active) setBoard(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => {
        // best-effort
      });
    return () => {
      active = false;
    };
  }, []);

  if (board.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <Trophy className="size-3.5 text-brand-pink" />
        Memory leaderboard
      </span>
      {board.slice(0, 3).map((s, i) => (
        <span key={`${s.name}-${i}`} className="whitespace-nowrap">
          {i + 1}. {s.name}{" "}
          <span className="text-muted-foreground/70">({s.moves})</span>
        </span>
      ))}
      <a
        href="/leaderboard"
        className="whitespace-nowrap underline underline-offset-2 transition-colors hover:text-foreground"
      >
        View all →
      </a>
    </div>
  );
}
