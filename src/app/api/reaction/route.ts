import { NextResponse } from "next/server";
import { getTopReactions } from "@/lib/reactions";
import { getSession } from "@/lib/auth";
import { topStandings } from "@/lib/ranking";
import { medal } from "@/lib/medals";

export const dynamic = "force-dynamic";

const ORDER = "best_ms.asc";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ReactionBody {
  ms?: unknown;
}

interface ExistingReaction {
  best_ms: number;
}

function restHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/** Fastest reaction times, lowest ms first. */
export async function GET(): Promise<NextResponse> {
  const scores = await getTopReactions(10);
  return NextResponse.json({ scores });
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Log in with Discord to submit a time." },
      { status: 401 },
    );
  }

  let body: ReactionBody;
  try {
    body = (await request.json()) as ReactionBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ms = Number(body.ms);

  // Human reaction floor is ~150ms; allow a margin but reject implausible
  // (bot-fast) values and absurdly slow ones.
  const valid = Number.isInteger(ms) && ms >= 100 && ms <= 5000;
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid time." },
      { status: 400 },
    );
  }

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: true, improved: true });
  }

  try {
    const base = `${supabaseUrl}/rest/v1/reactions`;
    const idFilter = `discord_id=eq.${encodeURIComponent(user.id)}`;

    const existingRes = await fetch(
      `${base}?${idFilter}&select=best_ms&limit=1`,
      { headers: restHeaders(serviceKey), cache: "no-store" },
    );
    if (!existingRes.ok) throw new Error(`Supabase ${existingRes.status}`);
    const existing = (await existingRes.json()) as ExistingReaction[];
    const prev = existing[0];
    const willImprove = !prev || ms < prev.best_ms;

    // Current leader before saving, to detect a dethrone.
    const preLeader = willImprove
      ? (await topStandings("reactions", ORDER, 1))[0]
      : undefined;

    const row = {
      discord_id: user.id,
      name: user.username,
      avatar: user.avatar,
      best_ms: ms,
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
    } else if (ms < prev.best_ms) {
      const updateRes = await fetch(`${base}?${idFilter}`, {
        method: "PATCH",
        headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!updateRes.ok) throw new Error(`Supabase ${updateRes.status}`);
      improved = true;
    } else {
      improved = false;
    }

    // Podium rank after saving (only when it changed).
    let podiumRank = 0;
    if (improved) {
      const standings = await topStandings("reactions", ORDER, 3);
      podiumRank = standings.findIndex((s) => s.discord_id === user.id) + 1;
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (webhook) {
      const verb = !prev ? "clocked" : improved ? "improved to" : "played";
      let tail = "";
      if (!improved && prev) {
        tail = " - best still stands";
      } else if (podiumRank >= 1 && podiumRank <= 3) {
        tail = ` ${medal(podiumRank)} now #${podiumRank}`;
        if (podiumRank === 1 && preLeader && preLeader.discord_id !== user.id) {
          tail += `, passed ${preLeader.name}`;
        }
      } else if (improved && prev) {
        tail = " - new personal best";
      }
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `⚡ <@${user.id}> ${verb} **${ms} ms** in Patch the Threat${tail}`,
            allowed_mentions: { users: [user.id] },
          }),
        });
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ ok: true, improved });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save time." },
      { status: 502 },
    );
  }
}
