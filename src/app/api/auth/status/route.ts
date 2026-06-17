import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic: reports only whether each auth env var is present
 * (booleans, never the values). Safe to expose; remove once login is verified.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    clientId: Boolean(process.env.DISCORD_CLIENT_ID),
    clientSecret: Boolean(process.env.DISCORD_CLIENT_SECRET),
    sessionSecret: Boolean(process.env.SESSION_SECRET),
    webhook: Boolean(process.env.DISCORD_WEBHOOK_URL),
  });
}
