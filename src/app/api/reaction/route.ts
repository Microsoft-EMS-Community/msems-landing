import { NextResponse } from "next/server";
import { getTopReactions, REACTION_ORDER } from "@/lib/reactions";
import { getSession } from "@/lib/auth";
import { submitScore, resultTail } from "@/lib/game-score";
import { guardSubmission } from "@/lib/game-guard";

export const dynamic = "force-dynamic";

interface ReactionBody {
  ms?: unknown;
  token?: unknown;
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

  const guard = await guardSubmission(body.token, "reaction");
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, error: "Start a game before submitting a time." },
      { status: 403 },
    );
  }

  const ms = Number(body.ms);

  // The score is an average of 6 rounds; no human averages below the ~150ms
  // reaction floor, so reject anything faster (bot/forged) or absurdly slow.
  const valid = Number.isInteger(ms) && ms >= 150 && ms <= 5000;
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
