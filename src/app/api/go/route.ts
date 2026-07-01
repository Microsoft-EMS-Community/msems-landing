import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/event";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  SLUG_RE,
  DAILY_LINK_LIMIT,
  validateDestination,
  slugBlockedReason,
  creatorKey,
  randomSlug,
  countRecentLinks,
  insertShortLink,
  announceLink,
} from "@/lib/short-links";

export const dynamic = "force-dynamic";

interface LinkBody {
  url?: unknown;
  slug?: unknown;
  turnstileToken?: unknown;
}

function fail(error: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}

const RATE_LIMIT_MESSAGE = `You've hit the limit of ${DAILY_LINK_LIMIT} links per day. Try again tomorrow.`;

/**
 * CSRF/abuse defense-in-depth: browsers always send Origin on cross-site
 * POSTs, so a mismatch with the request host means the call didn't come from
 * our own pages.
 */
function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

/** Client IP: Cloudflare's header first, then the standard proxy chain. */
function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Creates a short link. Requires passing the Cloudflare Turnstile check. */
export async function POST(request: Request): Promise<NextResponse> {
  if (isCrossOrigin(request)) {
    return fail("Cross-origin requests are not allowed.", 403);
  }

  let body: LinkBody;
  try {
    body = (await request.json()) as LinkBody;
  } catch {
    return fail("Invalid request body.", 400);
  }

  const ip = clientIp(request);
  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human) {
    return fail(
      "Could not verify you're human. Refresh the page and try again.",
      403,
    );
  }

  const destination = validateDestination(body.url);
  if (!destination.ok) {
    return fail(destination.error, 400);
  }

  const customSlug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (customSlug && !SLUG_RE.test(customSlug)) {
    return fail(
      "Short names are 3-40 characters: lowercase letters, numbers, and hyphens.",
      400,
    );
  }
  if (customSlug) {
    const blocked = slugBlockedReason(customSlug);
    if (blocked) return fail(blocked, 400);
  }

  const creatorId = creatorKey(ip);

  try {
    // Friendly early check; the database trigger enforces the same cap
    // atomically, so concurrent requests can't race past this read.
    const recent = await countRecentLinks(creatorId);
    if (recent >= DAILY_LINK_LIMIT) {
      return fail(RATE_LIMIT_MESSAGE, 429);
    }

    if (customSlug) {
      const result = await insertShortLink({
        slug: customSlug,
        url: destination.url,
        creatorId,
      });
      if (result === "taken") {
        return fail("That short name is already taken. Pick another.", 409);
      }
      if (result === "limited") {
        return fail(RATE_LIMIT_MESSAGE, 429);
      }
      if (result === "error") {
        return fail("Could not save the link right now. Try again.", 502);
      }
      await announceLink(customSlug, destination.url);
      return NextResponse.json({
        ok: true,
        slug: customSlug,
        shortUrl: `${SITE_URL}/go/${customSlug}`,
      });
    }

    // Auto-generated slug: retry a few times on the (rare) collision.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const slug = randomSlug();
      const result = await insertShortLink({
        slug,
        url: destination.url,
        creatorId,
      });
      if (result === "ok") {
        await announceLink(slug, destination.url);
        return NextResponse.json({
          ok: true,
          slug,
          shortUrl: `${SITE_URL}/go/${slug}`,
        });
      }
      if (result === "limited") {
        return fail(RATE_LIMIT_MESSAGE, 429);
      }
      if (result === "error") break;
    }
    return fail("Could not save the link right now. Try again.", 502);
  } catch {
    return fail("Could not save the link right now. Try again.", 502);
  }
}
