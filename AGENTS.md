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
  `/cfs-card`).
- Pages: `/`, `/tickets`, `/policies`, `/venue`, `/speakers`, `/share`, `/convince`,
  `/leaderboard`.

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
  `DISCORD_WEBHOOK_URL`. Supabase tables: `scores`, `soc_scores`, `reactions`, `signups`.

## Conventions
- **No em-dashes** in copy. American spelling.
- Escape apostrophes / `&` in JSX (`&apos;`, `&amp;`).
- `eslint --max-warnings=0` runs pre-commit (husky + lint-staged) — fix every warning.
- Verify with `npm run build` before committing.
