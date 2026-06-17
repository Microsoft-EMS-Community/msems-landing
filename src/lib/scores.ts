import { getTopGame } from "@/lib/leaderboards";

export interface ScoreRow {
  name: string;
  moves: number;
  time_seconds: number;
  avatar?: string | null;
}

export const MEMORY_ORDER = "moves.asc,time_seconds.asc";

/** Top scores, ranked by fewest moves then fastest time. */
export function getTopScores(limit = 10): Promise<ScoreRow[]> {
  return getTopGame<ScoreRow>(
    "scores",
    "name,moves,time_seconds,avatar",
    MEMORY_ORDER,
    limit,
  );
}

export function formatScoreTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
