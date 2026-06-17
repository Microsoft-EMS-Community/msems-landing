/** Podium medals for ranks 1, 2, 3. Pure (no env) so it's safe on client too. */
export const MEDALS = ["🥇", "🥈", "🥉"] as const;

/** Medal emoji for a 1-based rank, or "" outside the podium. */
export function medal(rank: number): string {
  return MEDALS[rank - 1] ?? "";
}
