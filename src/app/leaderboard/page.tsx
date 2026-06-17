import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getTopScores, formatScoreTime } from "@/lib/scores";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Memory Leaderboard | Microsoft EMS Community Summit",
  description: "Top scores for the MS EMS Community memory game.",
};

const RANK_ACCENT = ["text-brand-pink", "text-brand-purple", "text-brand-teal"];

export default async function LeaderboardPage() {
  const scores = await getTopScores(100);

  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl brand-gradient-bg">
            <Trophy className="size-7 text-white" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Memory leaderboard
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Fewest moves wins, with time as the tie-breaker. Think you can top
            it? Find the game in the footer or the menu.
          </p>
        </div>

        {scores.length > 0 ? (
          <ol className="mt-10 space-y-2">
            {scores.map((s, i) => (
              <li
                key={`${s.name}-${i}`}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 ${
                  i < 3
                    ? "border-brand-pink/30 bg-brand-pink/[0.06]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span
                  className={`w-8 shrink-0 text-center text-lg font-bold tabular-nums ${
                    RANK_ACCENT[i] ?? "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-medium">{s.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {s.moves}
                  </span>{" "}
                  moves
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-sm text-muted-foreground">
                  {formatScoreTime(s.time_seconds)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-muted-foreground">
            No scores yet — be the first to win!
          </p>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to the Summit
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
