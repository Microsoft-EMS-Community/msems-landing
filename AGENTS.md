<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Microsoft EMS Community Summit

Public landing site for the in-person summit (Fri 4 Sep 2026, at Microsoft, near
Copenhagen). Next.js 16 App Router, React 19, Tailwind v4, TypeScript.

## Where things live (edit data/copy here first)
- `src/lib/event.ts` — single source of truth: `EVENT`, `PRICING` (+ `allInPrice()`),
  `AGENDA` (fallback), `FAQS`, `HIGHLIGHTS`, `TOPICS`, `TEAM`, `COMMUNITY`.
- `src/lib/sessionize.ts` — agenda from the Sessionize **GridSmart** view, speakers
  from **Speakers** (event id `3zmvdvh1`). Sessionize is the source of truth for the
  agenda once published; `AGENDA` is the fallback.
- `src/lib/share.ts` + `src/lib/og-font.ts` — share posts and `next/og` card
  generators (`/share-card`, `/speaker-card`, `/announce-card`, `/attending-card`,
  `/cfs-card`, `/linkedin-cover` — 1774x444 LinkedIn group banner,
  `/cfs-banner` — 1280x320 white Sessionize Call-for-Speakers header).
- Pages: `/`, `/tickets`, `/policies`, `/venue`, `/speakers`, `/share`, `/convince`,
  `/leaderboard`, `/go` (community link shortener; see below).

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
  `DISCORD_WEBHOOK_URL`, `GAME_SIGNING_SECRET`. Supabase tables: `scores`,
  `soc_scores`, `reactions`, `signups`, `used_nonces`, `short_links`.

## Link shortener (`/go`)
- Cookie-free community shortener: `msems.community/go/<slug>` 302-redirects via
  `src/app/go/[slug]/route.ts`. No visitor data is stored; each click bumps a
  per-link `clicks` counter + `last_clicked_at` via the `record_click` RPC,
  fired with `after()` so it never delays the redirect. A pg_cron job prunes
  links never clicked within 90 days of creation.
- Creation (`POST /api/go`, form on `/go`) requires the Discord session login
  and a same-origin check, and validates destinations (http/https only, no
  links back into `/go/`). Custom slugs can't contain brand terms
  (msems/microsoft) or use reserved auth words like `login`
  (`slugBlockedReason`). Rate limit 10/day/user: the app-side row count in
  `src/lib/short-links.ts` is just the friendly early error — the authoritative
  cap is a Supabase BEFORE INSERT trigger (advisory lock per discord_id, so
  concurrent requests can't race it; surfaces as PostgREST error P0001).
- `/go` publicly lists ALL links (most-clicked first, `getPublicLinks`, cached
  60s) — a deliberate product choice; the page copy discloses it to creators.
- Moderation is webhook-based: every created link posts to
  `DISCORD_WEBHOOK_URL` (tags the creator); remove abuse by deleting the row
  in Supabase (`short_links`: slug PK, url, discord_id, discord_name,
  created_at, clicks, last_clicked_at).

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
