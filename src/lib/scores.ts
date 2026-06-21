import { getTopGame } from "@/lib/leaderboards";

export interface ScoreRow {
  name: string;
  moves: number;
  time_ms: number;
  avatar?: string | null;
}

export const MEMORY_ORDER = "moves.asc,time_ms.asc";

/** Top scores, ranked by fewest moves then fastest time (ms breaks ties). */
export function getTopScores(limit = 10): Promise<ScoreRow[]> {
  return getTopGame<ScoreRow>(
    "scores",
    "name,moves,time_ms,avatar",
    MEMORY_ORDER,
    limit,
  );
}

/** Format milliseconds as M:SS.cc (centiseconds), e.g. 15340 -> "0:15.34". */
export function formatScoreTime(ms: number): string {
  const cs = Math.round(ms / 10);
  const m = Math.floor(cs / 6000);
  const s = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  return `${m}:${s.toString().padStart(2, "0")}.${c.toString().padStart(2, "0")}`;
}
