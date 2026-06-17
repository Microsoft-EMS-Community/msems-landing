import { NextResponse, type NextRequest } from "next/server";
import {
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type DiscordUser,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const TOKEN_URL = "https://discord.com/api/oauth2/token";
const USER_URL = "https://discord.com/api/users/@me";
const STATE_COOKIE = "ems_oauth_state";
const RETURN_COOKIE = "ems_oauth_return";

interface TokenResponse {
  access_token?: string;
  token_type?: string;
}

interface DiscordApiUser {
  id?: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
}

/**
 * Discord OAuth2 callback: validate state, exchange the code for a token,
 * fetch the user, and set a signed session cookie. Any failure redirects
 * home with `?login=error` rather than leaking details.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = request.nextUrl;
  const fail = () => NextResponse.redirect(`${origin}/?login=error`);

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail();

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get(STATE_COOKIE)?.value;
  const rawReturn = request.cookies.get(RETURN_COOKIE)?.value ?? "/";
  const returnTo = rawReturn.startsWith("/") ? rawReturn : "/";

  // CSRF: the state echoed back by Discord must match the one we issued.
  if (!code || !state || !savedState || state !== savedState) return fail();

  const redirectUri = `${origin}/api/auth/discord/callback`;

  try {
    // Token exchange: x-www-form-urlencoded body + HTTP Basic auth, per spec.
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return fail();

    const token = (await tokenRes.json()) as TokenResponse;
    if (!token.access_token) return fail();

    const userRes = await fetch(USER_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!userRes.ok) return fail();

    const u = (await userRes.json()) as DiscordApiUser;
    if (!u.id) return fail();

    const user: DiscordUser = {
      id: String(u.id),
      username: (u.global_name || u.username || "Player").slice(0, 32),
      avatar: u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=64`
        : null,
    };

    const session = signSession(user);
    if (!session) return fail();

    const res = NextResponse.redirect(`${origin}${returnTo}`);
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: origin.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    res.cookies.delete(STATE_COOKIE);
    res.cookies.delete(RETURN_COOKIE);
    return res;
  } catch {
    return fail();
  }
}
