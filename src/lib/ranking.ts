const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface Standing {
  discord_id: string;
  name: string;
}

/**
 * Top N standings (discord_id + name) for a game table, used to work out a
 * player's podium rank after they submit.
 *
 * @param order PostgREST order clause, e.g. "moves.asc,time_seconds.asc".
 */
export async function topStandings(
  table: string,
  order: string,
  n: number,
): Promise<Standing[]> {
  if (!supabaseUrl || !serviceKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=discord_id,name&order=${order}&limit=${n}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as Standing[]) : [];
  } catch {
    return [];
  }
}
