import crypto from "node:crypto";
import { SITE_URL } from "@/lib/event";
import type { DiscordUser } from "@/lib/auth";

/**
 * Community link shortener backed by the existing Supabase project
 * (`short_links` table). Creating a link requires a verified Discord session
 * and is rate limited per user; the redirect itself is public and stores
 * nothing per click (no cookies, no IPs, no counters).
 *
 * Moderation is webhook-based: every created link is posted to the team
 * Discord channel, and removing an abusive link is a row delete in Supabase.
 */

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

/** 3-40 chars, lowercase letters/digits/hyphens, no leading/trailing hyphen. */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;
export const MAX_URL_LENGTH = 2048;
/** Max links one Discord account can create per rolling 24 hours. */
export const DAILY_LINK_LIMIT = 10;

/** Alphabet for generated slugs; skips look-alikes (0/o, 1/l/i). */
const SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const GENERATED_SLUG_LENGTH = 6;

/**
 * Impersonation guard for custom slugs. Brand terms can't appear anywhere in
 * a slug, and a few auth words are reserved outright because a link like
 * msems.community/go/login reads as a page of this site itself. Team links
 * are seeded via SQL, which skips this creation-time check.
 */
const BLOCKED_SLUG_SUBSTRINGS = ["msems", "microsoft"] as const;
const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "login",
  "signin",
  "sign-in",
  "verify",
  "mfa",
  "password",
  "account",
  "admin",
]);

/** Why a custom slug isn't allowed, or null when it's fine. */
export function slugBlockedReason(slug: string): string | null {
  if (RESERVED_SLUGS.has(slug)) {
    return "That short name is reserved.";
  }
  const brand = BLOCKED_SLUG_SUBSTRINGS.find((term) => slug.includes(term));
  return brand ? `Short names can't contain "${brand}".` : null;
}

export type DestinationCheck =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string };

/**
 * Public URL shorteners: chaining through one hides the real destination
 * from the public list and the moderation webhook. aka.ms stays allowed
 * (only Microsoft can create those).
 */
const SHORTENER_HOSTS: ReadonlySet<string> = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "is.gd",
  "ow.ly",
  "buff.ly",
  "cutt.ly",
  "tiny.cc",
  "rb.gy",
  "shorturl.at",
  "s.id",
]);

/** Destination hosts allowed to contain "microsoft" (real Microsoft domains). */
const MICROSOFT_DOMAINS = [
  "microsoft.com",
  "microsoftonline.com",
  "microsoft365.com",
  "microsoftstore.com",
] as const;

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Validates and normalizes a destination URL. Only public http(s) URLs are
 * accepted, and links back into the shortener itself are rejected so a slug
 * can never chain or loop through /go/.
 */
export function validateDestination(raw: unknown): DestinationCheck {
  const input = typeof raw === "string" ? raw.trim() : "";
  if (!input) {
    return { ok: false, error: "Enter the URL you want to shorten." };
  }
  if (input.length > MAX_URL_LENGTH) {
    return { ok: false, error: "That URL is too long (max 2048 characters)." };
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return {
      ok: false,
      error: "That doesn't look like a full URL. Include https:// in front.",
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Only http and https links can be shortened." };
  }
  if (!parsed.hostname.includes(".")) {
    return { ok: false, error: "Enter a public URL with a real domain." };
  }

  // Canonicalize before checking: strip any trailing FQDN dot so
  // "msems.community." can't sneak past host comparisons.
  const host = parsed.hostname.replace(/\.$/, "").toLowerCase();
  const bareHost = host.replace(/^www\./, "");

  // Raw IPs (v4 or bracketed v6): shared links never look like this,
  // phishing kits and malware drops often do.
  if (host.startsWith("[") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return { ok: false, error: "Use a domain name, not a raw IP address." };
  }

  if (SHORTENER_HOSTS.has(bareHost)) {
    return {
      ok: false,
      error: "That's already a shortener. Link straight to the destination.",
    };
  }

  // Brand impersonation: "microsoft" only on real Microsoft domains,
  // "msems" only on this site's own domain.
  if (
    host.includes("microsoft") &&
    !MICROSOFT_DOMAINS.some((domain) => hostMatches(host, domain))
  ) {
    return { ok: false, error: "That domain impersonates Microsoft." };
  }
  const siteHost = new URL(SITE_URL).hostname.replace(/^www\./, "");
  if (host.includes("msems") && !hostMatches(host, siteHost)) {
    return { ok: false, error: "That domain impersonates this site." };
  }

  const path = parsed.pathname;
  if (bareHost === siteHost && (path === "/go" || path.startsWith("/go/"))) {
    return { ok: false, error: "A short link can't point at another short link." };
  }

  return { ok: true, url: parsed.toString() };
}

/** Random 6-char slug from an unambiguous alphabet (~9 * 10^8 combinations). */
export function randomSlug(): string {
  let slug = "";
  for (let i = 0; i < GENERATED_SLUG_LENGTH; i += 1) {
    slug += SLUG_ALPHABET[crypto.randomInt(SLUG_ALPHABET.length)];
  }
  return slug;
}

function restHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/** Resolves a slug to its destination URL, or null when unknown. */
export async function getShortLink(slug: string): Promise<string | null> {
  if (!supabaseUrl || !serviceKey) return null;
  try {
    // Cached for 60s: hot slugs don't hammer Supabase on every click, and a
    // moderation delete still takes effect within about a minute.
    const res = await fetch(
      `${supabaseUrl}/rest/v1/short_links?slug=eq.${encodeURIComponent(slug)}&select=url&limit=1`,
      { headers: restHeaders(serviceKey), next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ url?: unknown }>;
    const url = rows[0]?.url;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

/** Number of links this user created in the last 24 hours (capped at limit). */
export async function countRecentLinks(discordId: string): Promise<number> {
  if (!supabaseUrl || !serviceKey) return 0;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const query =
    `discord_id=eq.${encodeURIComponent(discordId)}` +
    `&created_at=gte.${encodeURIComponent(since)}` +
    `&select=slug&limit=${DAILY_LINK_LIMIT}`;
  const res = await fetch(`${supabaseUrl}/rest/v1/short_links?${query}`, {
    headers: restHeaders(serviceKey),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const rows = (await res.json()) as unknown[];
  return Array.isArray(rows) ? rows.length : 0;
}

export interface PublicLink {
  readonly slug: string;
  readonly url: string;
  readonly discord_name: string | null;
  readonly clicks: number;
  readonly created_at: string;
}

/** All links for the public list on /go, most used first (cached 60s). */
export async function getPublicLinks(limit = 100): Promise<PublicLink[]> {
  if (!supabaseUrl || !serviceKey) return [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/short_links?select=slug,url,discord_name,clicks,created_at&order=clicks.desc,created_at.desc&limit=${limit}`,
      { headers: restHeaders(serviceKey), next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as PublicLink[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export type InsertResult = "ok" | "taken" | "limited" | "error";

/**
 * Inserts a link. "taken" when the slug already exists (PK conflict);
 * "limited" when the database trigger rejected it for exceeding the daily
 * cap. The trigger (see the table SQL) is the authoritative rate limit — it
 * serializes inserts per user, so concurrent requests can't race past the
 * app-side `countRecentLinks` pre-check.
 */
export async function insertShortLink(row: {
  slug: string;
  url: string;
  user: DiscordUser;
}): Promise<InsertResult> {
  if (!supabaseUrl || !serviceKey) return "error";
  const res = await fetch(`${supabaseUrl}/rest/v1/short_links`, {
    method: "POST",
    headers: { ...restHeaders(serviceKey), Prefer: "return=minimal" },
    body: JSON.stringify({
      slug: row.slug,
      url: row.url,
      discord_id: row.user.id,
      discord_name: row.user.username,
    }),
  });
  if (res.ok) return "ok";
  if (res.status === 409) return "taken";
  try {
    const body = (await res.json()) as { code?: unknown };
    // P0001 = plpgsql RAISE EXCEPTION, only raised by our daily-limit trigger.
    if (body.code === "P0001") return "limited";
  } catch {
    // Non-JSON error body; fall through to the generic failure.
  }
  return "error";
}

/**
 * Bumps the link's click counter and last-used timestamp via the
 * `record_click` RPC (an atomic `clicks = clicks + 1` update; PostgREST can't
 * express increments in a PATCH). Stores nothing about the visitor. Called
 * with `after()` so it never delays the redirect; counting is best-effort.
 */
export async function recordClick(slug: string): Promise<void> {
  if (!supabaseUrl || !serviceKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/rpc/record_click`, {
      method: "POST",
      headers: restHeaders(serviceKey),
      body: JSON.stringify({ p_slug: slug }),
    });
  } catch {
    // A lost count never matters; the redirect already happened.
  }
}


/** Posts the new link to the team Discord channel for moderation visibility. */
export async function announceLink(
  user: DiscordUser,
  slug: string,
  url: string,
): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🔗 <@${user.id}> created ${SITE_URL}/go/${slug} -> <${url}>`,
        // Ping only the creator; role/everyone mentions stay blocked.
        allowed_mentions: { users: [user.id] },
      }),
    });
  } catch {
    // Best-effort; never blocks link creation.
  }
}
