import { NextResponse } from "next/server";
import { getTopSoc, SOC_ORDER } from "@/lib/soc";
import { getSession } from "@/lib/auth";
import { submitScore, resultTail } from "@/lib/game-score";
import { guardSubmission } from "@/lib/game-guard";

export const dynamic = "force-dynamic";

interface SocBody {
  score?: unknown;
  token?: unknown;
}

interface PrevSoc {
  best_score: number;
}

/** Top Defender SOC scores, highest first. */
export async function GET(): Promise<NextResponse> {
  const scores = await getTopSoc(10);
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

  let body: SocBody;
  try {
    body = (await request.json()) as SocBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const guard = await guardSubmission(body.token, "soc");
  if (!guard.ok) {
    return NextResponse.json(
      { ok: false, error: "Start a game before submitting a score." },
      { status: 403 },
    );
  }

  const score = Number(body.score);
  const valid = Number.isInteger(score) && score >= 0 && score <= 200_000;
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid score." },
      { status: 400 },
    );
  }

  try {
    const { improved, rank } = await submitScore<PrevSoc>({
      user,
      table: "soc_scores",
      order: SOC_ORDER,
      selectPrev: "best_score",
      isBetter: (p) => score > p.best_score,
      row: { best_score: score },
      message: (ctx) =>
        `🛡️ <@${user.id}> ${!ctx.hasPrev ? "scored" : ctx.improved ? "improved to" : "logged"} **${score} pts** in Defender SOC${resultTail(ctx)}`,
    });
    return NextResponse.json({ ok: true, improved, rank });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save score." },
      { status: 502 },
    );
  }
}
