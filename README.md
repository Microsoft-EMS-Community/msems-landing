# Microsoft EMS Community Summit

The public landing site for the **Microsoft EMS Community Summit** — an
independent, community-run, not-for-profit event for admins and enthusiasts of
the Microsoft Enterprise Mobility + Security stack (Intune, Entra ID, Microsoft
Defender XDR and friends).

- **When:** Friday, September 4th, 2026
- **Where:** Microsoft, near Copenhagen (Kanalvej 7, 2800 Kongens Lyngby)
- **Live:** https://www.msems.community

Built by the community. Not affiliated with, endorsed by, or sponsored by
Microsoft.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript. Deployed on
Vercel (EU region) behind Cloudflare; games and signups use Supabase + Discord
OAuth.

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:3000
npm run build    # production build (run before committing)
```

A pre-commit hook runs `eslint --max-warnings=0`, so fix every warning.

## Where things live

- `src/lib/event.ts` — single source of truth: event details, pricing, agenda
  (fallback), FAQs, topics, team.
- `src/lib/sessionize.ts` — agenda + speakers from Sessionize once published.
- `src/lib/share.ts` + the `*-card` / `*-cover` routes — `next/og` share and
  banner image generators.
- Pages: `/`, `/tickets`, `/policies`, `/venue`, `/speakers`, `/share`,
  `/convince`, `/leaderboard`.
- Image routes (`next/og`): `/share-card`, `/speaker-card`, `/announce-card`,
  `/attending-card`, `/cfs-card`, `/cfs-banner`, `/linkedin-cover`.

See [`AGENTS.md`](./AGENTS.md) for the full project overview, conventions, and
the leaderboard anti-cheat model.

## Environment

Configured in Vercel (never commit secrets): `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
`DISCORD_WEBHOOK_URL`, `GAME_SIGNING_SECRET`.

## Contributing

Issues and PRs welcome. Verify with `npm run build` and keep lint clean before
opening a PR.
