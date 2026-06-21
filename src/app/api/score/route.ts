import { NextResponse } from "next/server";
import { getTopScores, formatScoreTime, MEMORY_ORDER } from "@/lib/scores";
import { getSession } from "@/lib/auth";
import { submitScore, resultTail } from "@/lib/game-score";
import { guardSubmission } from "@/lib/game-guard";

export const dynamic = "force-dynamic";

interface ScoreBody {
  moves?: unknown;
  time?: unknown;
  token?: unknown;
}

interface PrevScore {
  moves: number;
  time_seconds: number;
}

/** Top scores: fewest moves, then fastest time. */
export async function GET(): Promise<NextResponse> {
  const scores = await getTopScores(10);
  return NextResponse.json({ scores });
}

export async function POST(request: Request): Promise<NextResponse> {
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

  const guard = await guardSubmission(body.token, "memory");
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, error: "Start a game before submitting a score." },
      { status: 403 },
    );
  }

  const moves = Number(body.moves);
  const time = Number(body.time);

  // Sanity bounds: 6 pairs => 6 minimum moves. Every move is two card flips, so
  // a full board can't be cleared faster than ~0.5s/move (and never under 3s),
  // which rejects the "6 moves in 0:01" type forgery.
  const minTime = Math.max(3, Math.round(moves * 0.5));
  const valid =
    Number.isInteger(moves) &&
    moves >= 6 &&
    moves <= 500 &&
    Number.isInteger(time) &&
    time >= minTime &&
    time <= 7200;
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid score." },
      { status: 400 },
    );
  }

  try {
    const { improved, rank } = await submitScore<PrevScore>({
      user,
      table: "scores",
      order: MEMORY_ORDER,
      selectPrev: "moves,time_seconds",
      isBetter: (p) =>
        moves < p.moves || (moves === p.moves && time < p.time_seconds),
      row: { moves, time_seconds: time },
      message: (ctx) =>
        `🎮 <@${user.id}> ${!ctx.hasPrev ? "scored" : ctx.improved ? "improved to" : "played"} **${moves} moves** · ${formatScoreTime(time)} in the MS EMS memory game${resultTail(ctx)}`,
    });
    return NextResponse.json({ ok: true, improved, rank });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save score." },
      { status: 502 },
    );
  }
}
