const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface ScoreRow {
  name: string;
  moves: number;
  time_seconds: number;
}

/** Top scores, ranked by fewest moves then fastest time. */
export async function getTopScores(limit = 10): Promise<ScoreRow[]> {
  if (!supabaseUrl || !serviceKey) return [];
  const capped = Math.min(Math.max(1, Math.trunc(limit)), 100);
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/scores?select=name,moves,time_seconds&order=moves.asc,time_seconds.asc&limit=${capped}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as ScoreRow[]) : [];
  } catch {
    return [];
  }
}

export function formatScoreTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
