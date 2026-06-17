import { getTopGame } from "@/lib/leaderboards";

export interface ReactionRow {
  name: string;
  best_ms: number;
  avatar?: string | null;
}

export const REACTION_ORDER = "best_ms.asc";

/** Top reaction times, fastest (lowest ms) first. */
export function getTopReactions(limit = 10): Promise<ReactionRow[]> {
  return getTopGame<ReactionRow>(
    "reactions",
    "name,best_ms,avatar",
    REACTION_ORDER,
    limit,
  );
}
