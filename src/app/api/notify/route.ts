import { NextResponse } from "next/server";

// Basic, dependency-free email shape check. Validation happens at this
// boundary before anything is done with the value.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NotifyBody {
  email?: unknown;
}

/**
 * Stores a "notify me" signup in Supabase via its REST API (no SDK needed).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (auto-injected by the
 * Vercel + Supabase integration). Falls back to logging if not configured.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: NotifyBody;
  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Server-only secret key (bypasses RLS). Supports the new sb_secret_* key
  // (SUPABASE_SECRET_KEY) and the legacy service-role key name.
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Storage not configured yet (e.g. local without env). Don't break the UX.
    console.info(`[notify] signup received (no store configured): ${email}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/signups?on_conflict=email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          // Ignore duplicate emails; don't return the row.
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({ email, source: "website" }),
      },
    );

    if (!res.ok && res.status !== 409) {
      const detail = await res.text();
      throw new Error(`Supabase responded ${res.status}: ${detail}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("[notify] failed to store signup:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save right now. Please try again." },
      { status: 502 },
    );
  }
}
