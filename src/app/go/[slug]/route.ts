import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/event";
import { SLUG_RE, getShortLink } from "@/lib/short-links";

export const dynamic = "force-dynamic";

/**
 * Public short-link redirect: msems.community/go/<slug> -> destination.
 * Cookie-free and stores nothing per click. Unknown slugs land on the
 * shortener page with a notice instead of a bare 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const normalized = slug.toLowerCase();

  const url = SLUG_RE.test(normalized) ? await getShortLink(normalized) : null;
  const res = url
    ? NextResponse.redirect(url, 302)
    : NextResponse.redirect(`${SITE_URL}/go?missing=1`, 302);

  // Let the CDN absorb repeat clicks for a minute, but never let browsers
  // hold a stale redirect: a moderation delete must take effect quickly.
  res.headers.set(
    "Cache-Control",
    url ? "public, max-age=0, s-maxage=60" : "no-store",
  );
  // Short links are shared, not indexed; keep crawlers off the redirects.
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
