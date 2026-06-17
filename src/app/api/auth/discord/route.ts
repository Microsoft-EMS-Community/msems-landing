import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { SITE_URL } from "@/lib/event";

export const dynamic = "force-dynamic";

const AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const STATE_COOKIE = "ems_oauth_state";
const RETURN_COOKIE = "ems_oauth_return";

/**
 * In production the origin is pinned to the canonical domain so the OAuth
 * redirect_uri always matches what's registered with Discord, even behind a
 * proxy (Cloudflare). In dev it follows the request (localhost).
 */
function appOrigin(request: NextRequest): string {
  return process.env.NODE_ENV === "production"
    ? SITE_URL
    : request.nextUrl.origin;
}

/**
 * Start the Discord OAuth2 authorization-code flow.
 * Sets a short-lived, signed `state` cookie for CSRF protection (validated in
 * the callback) and remembers where to send the user back to.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const origin = appOrigin(request);
  const { searchParams } = request.nextUrl;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/?login=unconfigured`);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/discord/callback`;

  // Only ever return to a same-site relative path.
  const requested = searchParams.get("return_to") ?? "/";
  const returnTo = requested.startsWith("/") ? requested : "/";

  const authUrl = new URL(AUTHORIZE_URL);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("scope", "identify");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "consent");

  const res = NextResponse.redirect(authUrl);
  const secure = origin.startsWith("https");
  const cookieOpts = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 minutes to complete the flow
  };
  res.cookies.set(STATE_COOKIE, state, cookieOpts);
  res.cookies.set(RETURN_COOKIE, returnTo, cookieOpts);
  return res;
}
