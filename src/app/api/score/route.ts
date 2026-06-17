import { NextResponse } from "next/server";
import { getTopScores, formatScoreTime } from "@/lib/scores";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ScoreBody {
  moves?: unknown;
  time?: unknown;
}

interface ExistingScore {
  moves: number;
  time_seconds: number;
}

function restHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/** A run beats the stored one on fewer moves, then faster time. */
function isBetter(
  moves: number,
  time: number,
  prev: ExistingScore,
): boolean {
  return moves < prev.moves || (moves === prev.moves && time < prev.time_seconds);
}

/** Top scores: fewest moves, then fastest time. */
export async function GET(): Promise<NextResponse> {
  const scores = await getTopScores(10);
  return NextResponse.json({ scores });
}

export async function POST(request: Request): Promise<NextResponse> {
  // Identity comes from the verified session cookie, never from the client,
  // so a score can't be submitted under another person's name.
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Log in with Discord to submit a score." },
      { status: 401 },
    );
  }

  let body: ScoreBody;
  try {
    body = (await request.json()) as ScoreBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const moves = Number(body.moves);
  const time = Number(body.time);

  // Sanity bounds: 6 pairs => 6 minimum moves; cap to keep it tidy.
  const valid =
    Number.isInteger(moves) &&
    moves >= 6 &&
    moves <= 500 &&
    Number.isInteger(time) &&
    time >= 1 &&
    time <= 7200;

  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid score." },
      { status: 400 },
    );
  }

  // No DB configured: accept so the UI still works in local/dev.
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: true, improved: true });
  }

  try {
    const base = `${supabaseUrl}/rest/v1/scores`;
    const idFilter = `discord_id=eq.${encodeURIComponent(user.id)}`;

    // One row per Discord user — look up their current best.
    const existingRes = await fetch(
      `${base}?${idFilter}&select=moves,time_seconds&limit=1`,
      { headers: restHeaders(serviceKey), cache: "no-store" },
    );
    if (!existingRes.ok) throw new Error(`Supabase ${existingRes.status}`);
    const existing = (await existingRes.json()) as ExistingScore[];
    const prev = existing[0];

    const row = {
      discord_id: user.id,
      name: user.username,
      avatar: user.avatar,
      moves,
      time_seconds: time,
    };

    let improved: boolean;
    if (!prev) {
      const insertRes = await fetch(base, {
        method: "POST",
        headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!insertRes.ok) throw new Error(`Supabase ${insertRes.status}`);
      improved = true;
    } else if (isBetter(moves, time, prev)) {
      const updateRes = await fetch(`${base}?${idFilter}`, {
        method: "PATCH",
        headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!updateRes.ok) throw new Error(`Supabase ${updateRes.status}`);
      improved = true;
    } else {
      improved = false; // kept their existing, better score
    }

    // Announce only genuine new/improved entries to Discord (no spam from
    // repeated non-improving plays). Off until the webhook URL is set.
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (improved && webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `🥇 **${user.username}** ${prev ? "improved to" : "scored"} **${moves} moves** · ${formatScoreTime(time)} in the EMS Memory game`,
            allowed_mentions: { parse: [] },
          }),
        });
      } catch {
        // best-effort; never blocks the score from saving
      }
    }

    return NextResponse.json({ ok: true, improved });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save score." },
      { status: 502 },
    );
  }
}
