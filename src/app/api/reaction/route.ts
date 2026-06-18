import { NextResponse } from "next/server";
import { getTopReactions, REACTION_ORDER } from "@/lib/reactions";
import { getSession } from "@/lib/auth";
import { submitScore, resultTail } from "@/lib/game-score";

export const dynamic = "force-dynamic";

interface ReactionBody {
  ms?: unknown;
}

interface PrevReaction {
  best_ms: number;
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

  try {
    const { improved, rank } = await submitScore<PrevReaction>({
      user,
      table: "reactions",
      order: REACTION_ORDER,
      selectPrev: "best_ms",
      isBetter: (p) => ms < p.best_ms,
      row: { best_ms: ms },
      message: (ctx) =>
        `⚡ <@${user.id}> ${!ctx.hasPrev ? "clocked" : ctx.improved ? "improved to" : "played"} **${ms} ms** in Patch the Threat${resultTail(ctx)}`,
    });
    return NextResponse.json({ ok: true, improved, rank });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save time." },
      { status: 502 },
    );
  }
}
