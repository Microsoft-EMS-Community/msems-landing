import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Lightweight, dependency-free session for the memory-game competition.
 * A signed (HMAC-SHA256) cookie holds the verified Discord identity, so a
 * score can never be submitted under someone else's name. No DB sessions,
 * no auth library: the cookie is the source of truth and is tamper-evident.
 */

export const SESSION_COOKIE = "ems_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Verified Discord identity stored in the session cookie. */
export interface DiscordUser {
  readonly id: string;
  readonly username: string;
  readonly avatar: string | null;
}

function getSecret(): string | null {
  return process.env.SESSION_SECRET ?? null;
}

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function hmac(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Sign a session token, or null if signing isn't configured. */
export function signSession(user: DiscordUser): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const payload = b64url(JSON.stringify(user));
  return `${payload}.${hmac(payload, secret)}`;
}

/** Verify and decode a session token. Returns null on any tampering. */
export function verifySession(token: string | undefined): DiscordUser | null {
  const secret = getSecret();
  if (!secret || !token) return null;

  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = hmac(payload, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      data &&
      typeof data === "object" &&
      typeof (data as DiscordUser).id === "string" &&
      typeof (data as DiscordUser).username === "string"
    ) {
      const u = data as DiscordUser;
      return { id: u.id, username: u.username, avatar: u.avatar ?? null };
    }
    return null;
  } catch {
    return null;
  }
}

/** Read the current verified session from the request cookies. */
export async function getSession(): Promise<DiscordUser | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
