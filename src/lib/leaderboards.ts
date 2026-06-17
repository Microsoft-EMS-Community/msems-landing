const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Generic top-N reader for any game leaderboard table. */
export async function getTopGame<T>(
  table: string,
  select: string,
  order: string,
  limit = 10,
): Promise<T[]> {
  if (!supabaseUrl || !serviceKey) return [];
  const capped = Math.min(Math.max(1, Math.trunc(limit)), 100);
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=${select}&order=${order}&limit=${capped}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}
