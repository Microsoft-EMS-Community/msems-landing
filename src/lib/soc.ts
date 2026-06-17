import { getTopGame } from "@/lib/leaderboards";

export interface SocRow {
  name: string;
  best_score: number;
  avatar?: string | null;
}

export const SOC_ORDER = "best_score.desc";

/** Top Defender SOC scores, highest first. */
export function getTopSoc(limit = 10): Promise<SocRow[]> {
  return getTopGame<SocRow>(
    "soc_scores",
    "name,best_score,avatar",
    SOC_ORDER,
    limit,
  );
}
