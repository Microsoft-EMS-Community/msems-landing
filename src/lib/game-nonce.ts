/**
 * Single-use enforcement for game tokens. Each token carries a random nonce;
 * on submit we try to insert it into `used_nonces`. The table's UNIQUE
 * constraint makes this atomic, so a replayed token loses the race and is
 * rejected. Only used nonces are stored, and a nonce older than the longest
 * token window is dead weight, so the table can be trimmed by a periodic job.
 */

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Atomically claim a nonce. Returns true if it was unused (valid first use),
 * false if it was already used (replay) or on any error (fail closed).
 */
export async function consumeNonce(nonce: string): Promise<boolean> {
  // No DB configured (local/dev): nothing to enforce against.
  if (!supabaseUrl || !serviceKey) return true;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/used_nonces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ nonce }),
      cache: "no-store",
    });
    if (res.status === 201) return true; // inserted -> first use
    if (res.status === 409) return false; // unique violation -> replay
    return false; // unexpected -> fail closed
  } catch {
    return false; // network error -> fail closed
  }
}
