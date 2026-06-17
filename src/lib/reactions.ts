const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface ReactionRow {
  name: string;
  best_ms: number;
  avatar?: string | null;
}

/** Top reaction times, fastest (lowest ms) first. */
export async function getTopReactions(limit = 10): Promise<ReactionRow[]> {
  if (!supabaseUrl || !serviceKey) return [];
  const capped = Math.min(Math.max(1, Math.trunc(limit)), 100);
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/reactions?select=name,best_ms,avatar&order=best_ms.asc&limit=${capped}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as ReactionRow[]) : [];
  } catch {
    return [];
  }
}
