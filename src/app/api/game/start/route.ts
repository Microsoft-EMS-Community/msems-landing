import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { issueToken, isGameName } from "@/lib/game-token";

export const dynamic = "force-dynamic";

interface StartBody {
  game?: unknown;
}

/** Issue a signed session token for a starting run. Login required. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Log in with Discord to play." },
      { status: 401 },
    );
  }

  let body: StartBody;
  try {
    body = (await request.json()) as StartBody;
  } catch {
    body = {};
  }
  if (!isGameName(body.game)) {
    return NextResponse.json(
      { ok: false, error: "Unknown game." },
      { status: 400 },
    );
  }

  // Unconfigured (no signing secret): null token, the guard stays permissive.
  const issued = issueToken(body.game, Date.now());
  return NextResponse.json({
    ok: true,
    token: issued?.token ?? null,
    seed: issued?.seed ?? 0,
  });
}
