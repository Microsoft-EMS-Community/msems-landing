/**
 * Shared Defender SOC scoring rules — the single source for both the client
 * game and the server-side plausibility cap, so the cap tracks the game's
 * balance instead of being a hand-tuned magic number. Note: the max score is
 * bounded by shift length, spawn rate and per-alert points, NOT by how many
 * scenarios exist, so adding scenarios never changes the ceiling.
 */

export const SOC_SHIFT_MS = 100_000;
export const SOC_SPAWN_SLOW_MS = 3500; // spawn interval at the start of a shift
export const SOC_SPAWN_FAST_MS = 1300; // spawn interval by the end of a shift
export const SOC_SURVIVE_BONUS = 500;
/** 1 + min(streak, 10) * 0.1 tops out here. */
export const SOC_STREAK_MULT_MAX = 2;
export const SOC_SEV_POINTS: Record<"high" | "med" | "low", number> = {
  high: 130,
  med: 80,
  low: 40,
};

/**
 * A generous plausibility ceiling for a flawless shift, used as the API cap.
 * Assumes the fastest spawn rate for the whole shift (an over-count, since the
 * early shift is slower) and every alert high-severity at max streak, then adds
 * 50% headroom — so it never rejects a legit run, only forged ones.
 */
export function socMaxPlausibleScore(): number {
  const maxAlerts = Math.ceil(SOC_SHIFT_MS / SOC_SPAWN_FAST_MS);
  const perAlert = SOC_SEV_POINTS.high * SOC_STREAK_MULT_MAX;
  return Math.ceil((maxAlerts * perAlert + SOC_SURVIVE_BONUS) * 1.5);
}
