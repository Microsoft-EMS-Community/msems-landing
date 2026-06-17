import { NextResponse } from "next/server";

// Basic, dependency-free email shape check. Validation happens at this
// boundary before anything is done with the value.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NotifyBody {
  email?: unknown;
}

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

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // TODO: connect a real destination here (Microsoft Forms/List, Mailchimp,
  // Resend audience, etc). For now we just acknowledge the signup so the UI
  // can confirm. No email is stored yet.
  console.info(`[notify] new signup: ${email}`);

  return NextResponse.json({ ok: true });
}
