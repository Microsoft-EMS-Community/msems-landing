import { topStandings } from "@/lib/ranking";
import { medal } from "@/lib/medals";
import type { DiscordUser } from "@/lib/auth";

/**
 * Shared scoring engine for every game's API route. A route only describes its
 * table, ordering, what "better" means, the row to write, and how to phrase the
 * Discord post — this handles keep-best upsert, podium rank, dethrone detection
 * and the announcement. Adding a game = a thin route + a table, nothing copied.
 */

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

function restHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

export interface MessageCtx {
  /** True when this run created or improved the player's entry. */
  improved: boolean;
  /** True when the player already had a stored best. */
  hasPrev: boolean;
  /** The player's current 1-based rank (0 if outside the top 100). */
  rank: number;
  /** Name of the player who just lost #1, when applicable. */
  passedName?: string;
}

export interface SubmitConfig<Prev> {
  user: DiscordUser;
  /** Supabase table, e.g. "scores" | "reactions" | "soc_scores". */
  table: string;
  /** PostgREST order clause for ranking, e.g. "best_score.desc". */
  order: string;
  /** Columns to read for the previous-best comparison. */
  selectPrev: string;
  /** Is the incoming run better than the stored one? */
  isBetter: (prev: Prev) => boolean;
  /** Game-specific columns to upsert (discord_id/name/avatar are added). */
  row: Record<string, unknown>;
  /** Build the Discord message, or return "" to skip the post. */
  message: (ctx: MessageCtx) => string;
}

/** Standard suffix: best-stands / current place (+ medal + dethrone). */
export function resultTail(ctx: MessageCtx): string {
  if (!ctx.improved && ctx.hasPrev) return " - best still stands";
  if (ctx.rank >= 1) {
    const m = medal(ctx.rank); // "" outside the podium
    let tail = ` ${m ? `${m} ` : ""}now #${ctx.rank}`;
    if (ctx.rank === 1 && ctx.passedName) {
      tail += `, passed ${ctx.passedName}`;
    }
    return tail;
  }
  if (ctx.improved && ctx.hasPrev) return " - new personal best";
  return "";
}

/** Keep-best upsert by discord_id + podium-aware Discord announcement. */
export async function submitScore<Prev>(
  cfg: SubmitConfig<Prev>,
): Promise<{ improved: boolean; rank: number }> {
  // No DB configured: accept so the UI still works in local/dev.
  if (!supabaseUrl || !serviceKey) return { improved: true, rank: 0 };

  const base = `${supabaseUrl}/rest/v1/${cfg.table}`;
  const idFilter = `discord_id=eq.${encodeURIComponent(cfg.user.id)}`;

  const existingRes = await fetch(
    `${base}?${idFilter}&select=${cfg.selectPrev}&limit=1`,
    { headers: restHeaders(serviceKey), cache: "no-store" },
  );
  if (!existingRes.ok) throw new Error(`Supabase ${existingRes.status}`);
  const existing = (await existingRes.json()) as Prev[];
  const prev = existing[0];
  const hasPrev = Boolean(prev);
  const willImprove = !prev || cfg.isBetter(prev);

  // Current leader before saving, to detect a dethrone.
  const preLeader = willImprove
    ? (await topStandings(cfg.table, cfg.order, 1))[0]
    : undefined;

  const row = {
    discord_id: cfg.user.id,
    name: cfg.user.username,
    avatar: cfg.user.avatar,
    ...cfg.row,
  };

  let improved: boolean;
  if (!prev) {
    const res = await fetch(base, {
      method: "POST",
      headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    improved = true;
  } else if (cfg.isBetter(prev)) {
    const res = await fetch(`${base}?${idFilter}`, {
      method: "PATCH",
      headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    improved = true;
  } else {
    improved = false;
  }

  // The player's current rank (top 100), for the win screen + announcement.
  const standings = await topStandings(cfg.table, cfg.order, 100);
  const rank = standings.findIndex((s) => s.discord_id === cfg.user.id) + 1;

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (webhook) {
    const passedName =
      preLeader && preLeader.discord_id !== cfg.user.id
        ? preLeader.name
        : undefined;
    const content = cfg.message({ improved, hasPrev, rank, passedName });
    if (content) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            allowed_mentions: { users: [cfg.user.id] },
          }),
        });
      } catch {
        // best-effort; never blocks the score from saving
      }
    }
  }

  return { improved, rank };
}
