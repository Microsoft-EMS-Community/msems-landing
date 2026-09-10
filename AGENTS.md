<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Microsoft EMS Community Summit

Public landing site for the in-person summit (Fri 4 Sep 2026, at Microsoft, near
Copenhagen). Next.js 16 App Router, React 19, Tailwind v4, TypeScript.

## Where things live (edit data/copy here first)
- `src/lib/event.ts` — single source of truth: `EVENT`, `PRICING` (+ `allInPrice()`),
  `AGENDA` (the final schedule), `FAQS`, `HIGHLIGHTS`, `TOPICS`, `TEAM`, `COMMUNITY`.
- `src/lib/sessionize.ts` — speakers from the Sessionize **Speakers** view (event id
  `3zmvdvh1`). The agenda is hand-maintained in `AGENDA`; `src/lib/agenda.ts`
  (`getAgenda`) joins speaker photos/taglines in by name and degrades to
  name-only credits if Sessionize is down.
- `/stage` — unlinked, noindex run-of-show timer for the team (`src/lib/run-of-show.ts`
  + `src/components/stage/*`). State lives in that browser's localStorage only.
- `src/lib/share.ts` + `src/lib/og-font.ts` — share posts and `next/og` card
  generators (`/share-card`, `/speaker-card`, `/announce-card`, `/attending-card`,
  `/cfs-card`, `/linkedin-cover` — 1774x444 LinkedIn group banner,
  `/cfs-banner` — 1280x320 white Sessionize Call-for-Speakers header).
- Pages: `/`, `/tickets`, `/policies`, `/venue`, `/speakers`, `/photos`, `/share`, `/convince`,
  `/leaderboard`, `/budget` (open books: income/bills in `src/lib/budget.ts`, bill
  scans in `public/bills/`), `/go` (community link shortener; see below).

## Event photos (`/photos`)
- 235 photos, committed to the repo, no external storage or paid service:
  `public/photos/full/*.jpg` (high-quality JPEG, the download) +
  `public/photos/thumb/*.webp` (800px grid thumbnails). ~256 MB total.
- Regenerate with `node scripts/build-photos.mjs` (needs the `sharp`
  devDependency). Source folders are the `SOURCES` array at the top of the
  script. Idempotent, so dropping new originals into a listed folder and
  re-running only converts the new ones; `--force` redoes everything.
- **IDs are sticky.** The manifest (`src/lib/photos.json`) records the original
  each id came from, so re-runs reuse ids and only mint new ones for unseen
  originals. That keeps `/photos/full/msems-2026-042.jpg` pointing at the same
  picture after photos are added, which matters once links are shared. Deleting
  a photo retires its id rather than recycling it.
- **iPhone HEICs need a pre-pass**: sharp's bundled libheif fails on Apple's
  HEIC variant ("bad seek", the item index runs past EOF) while Windows' own
  codec reads them fine. `pwsh -File scripts/heic-to-png.ps1` decodes them to
  lossless PNG in `keep/converted`, which is what `SOURCES` points at.
- `MAX_EDGE` caps a download's long edge at 6000px. Only bites on outliers
  (one 12240x16320 phone shot: 10 MB uncapped, 1.9 MB capped).
- The script prints anything it skipped as an unsupported type, so a stray video
  or raw file never disappears quietly. `keep/New folder (2)` holds a 92 MB
  `.mp4` that is deliberately not published; the gallery is stills only.
- Not published: `keep/jpg`, `keep/jpg-2048`, `keep/soft` and `keep/extra` are
  working copies of PWR shots already in the main set, so listing them in
  `SOURCES` would publish duplicates. (`keep/jpg-2048` does hold a handful of
  non-PWR files that are not in the set: `IMG_3183/3198/3205.jpeg`,
  `image0.jpg`, `20260904_145715_crop.jpg`.)
- Thumbnails render as plain `<img>`, not `next/image`: they are already
  pre-sized static files, so optimizing them again would only burn Vercel quota.
- **Entirely out of search.** The page sets `robots: { index: false, follow:
  false }` like `/stage`, is kept out of `sitemap.ts`, and the image files carry
  `X-Robots-Tag: noindex` (`next.config.ts`). It stays linked from the nav and
  footer, so attendees still find it. `robots.ts` deliberately still allows
  crawling: a `Disallow` would stop crawlers reading the noindex at all, which
  is how disallowed URLs end up indexed anyway.
- Photos are in capture order (`taken` in the manifest), one timeline across all
  three cameras. Display order is independent of ids, so re-sorting never moves
  a URL. The grid is justified flex rows, not CSS columns: columns fill
  top-to-bottom, which would hide the chronology.
- Deliberately no takedown/removal copy on the page.
- Because these are in git, deleting a file does not erase it from history. A
  real erasure request means rewriting history, or moving the set off the repo.

## Tickets
- Weeztix shop embedded as a **plain `<iframe>`** (their injector.js/integrate.js break
  cross-origin) sized by the `iframe-resizer` parent. Shared popout modal via
  `tickets-provider.tsx` + `ticket-button.tsx` + `ticket-modal.tsx`; also a `/tickets`
  page. All "get ticket" CTAs open that modal.
- Prices are shown **all-in** (ticket + €1 service + 3.5% fee) via `allInPrice()`.

## Infra / deploy
- GitHub → Vercel (auto-deploy on push to `main`), behind Cloudflare. Functions pinned
  to EU (`arn1`) in `vercel.json`. CSP + security headers in `next.config.ts` (allows
  `frame-src https://shop.weeztix.com`).
- Games + signups use Supabase (REST) + Discord OAuth. Vercel env vars:
  `SUPABASE_URL`/`SUPABASE_SECRET_KEY`, `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET`,
  `DISCORD_WEBHOOK_URL`, `GAME_SIGNING_SECRET`,
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` (link shortener).
  Supabase tables: `scores`,
  `soc_scores`, `reactions`, `signups`, `used_nonces`, `short_links`.

## Link shortener (`/go`)
- Cookie-free community shortener: `msems.community/go/<slug>` 302-redirects via
  `src/app/go/[slug]/route.ts`. No visitor data is stored; each click bumps a
  per-link `clicks` counter + `last_clicked_at` via the `record_click` RPC,
  fired with `after()` so it never delays the redirect. A pg_cron job prunes
  links never clicked within 90 days of creation.
- Creation (`POST /api/go`, form on `/go`) needs no account: it's gated by
  Cloudflare Turnstile (`src/lib/turnstile.ts`; env vars
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`; fails CLOSED in
  production when the secret is missing, permissive in dev) plus a
  same-origin check. Destinations are validated (http/https only; no links
  back into `/go/`, raw IPs, public shorteners, or hosts impersonating
  microsoft/msems - see `validateDestination`). Custom slugs can't contain
  brand terms (msems/microsoft) or use reserved auth words like `login`
  (`slugBlockedReason`). Rate limit 10/day/creator, keyed on `creatorKey()`
  (an HMAC of the IP stored in the `discord_id` column; creation only, clicks
  store nothing): the app-side row count is just the friendly early error —
  the authoritative cap is a Supabase BEFORE INSERT trigger (advisory lock
  per discord_id, so concurrent requests can't race it; surfaces as PostgREST
  error P0001). Team links seeded via SQL keep `discord_name` and show
  "by ..." in the public list; anonymous links don't.
- `/go` publicly lists ALL links (most-clicked first, `getPublicLinks`, cached
  60s) — a deliberate product choice; the page copy discloses it to creators.
- Moderation is webhook-based: every created link posts to
  `DISCORD_WEBHOOK_URL`; remove abuse by deleting the row in Supabase
  (`short_links`: slug PK, url, discord_id, discord_name, created_at,
  clicks, last_clicked_at).

## Leaderboard anti-cheat (games)
- Scores are guarded server-side. A run starts via `POST /api/game/start`
  (Discord login required), which issues an HMAC-signed, single-use,
  time-bounded session token (`src/lib/game-token.ts`). Each submit route
  (`/api/score`, `/api/reaction`, `/api/soc`) calls `guardSubmission()`
  (`game-guard.ts`), which verifies the token and atomically claims its nonce
  via the `used_nonces` UNIQUE constraint (`game-nonce.ts`) to block replay.
- **Activation:** dormant/permissive until BOTH the `used_nonces` table exists
  AND `GAME_SIGNING_SECRET` is set (create the table first, or all submits fail).
- Plus per-game plausibility bounds (reaction ≥150ms; memory time floor
  `max(3, moves*0.5)s`; SOC cap derived from `soc-rules.ts`, so the cap tracks
  the game balance and scenario count never changes it).
- Known limit: client-rendered games (memory/SOC/reaction) can't be made *fully*
  server-authoritative via log replay — the client must hold the game state to
  play. The token + bounds are deliberate "good enough" deterrence; full
  authority would need a server-driven (per-flip / streamed) rewrite.

## Conventions
- **No em-dashes** in copy. American spelling.
- Escape apostrophes / `&` in JSX (`&apos;`, `&amp;`).
- `eslint --max-warnings=0` runs pre-commit (husky + lint-staged) — fix every warning.
- Verify with `npm run build` before committing.
