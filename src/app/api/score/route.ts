import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ScoreBody {
  name?: unknown;
  moves?: unknown;
  time?: unknown;
}

function restHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/** Top scores: fewest moves, then fastest time. */
export async function GET(): Promise<NextResponse> {
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ scores: [] });
  }
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/scores?select=name,moves,time_seconds&order=moves.asc,time_seconds.asc&limit=10`,
      { headers: restHeaders(serviceKey), cache: "no-store" },
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const scores = await res.json();
    return NextResponse.json({ scores });
  } catch {
    return NextResponse.json({ scores: [] });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ScoreBody;
  try {
    body = (await request.json()) as ScoreBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Collapse whitespace, trim, cap length (keeps spaces, drops tabs/newlines).
  const name =
    typeof body.name === "string"
      ? body.name.replace(/\s+/g, " ").trim().slice(0, 24)
      : "";
  const moves = Number(body.moves);
  const time = Number(body.time);

  // Sanity bounds: 6 pairs => 6 minimum moves; cap to keep it tidy.
  const valid =
    name.length >= 1 &&
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

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/scores`, {
      method: "POST",
      headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify({ name, moves, time_seconds: time }),
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not save score." },
      { status: 502 },
    );
  }
}
