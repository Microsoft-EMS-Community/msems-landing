import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Gamepad2, ShieldCheck, Trophy, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  GameLauncher,
  PatchLauncher,
  SocLauncher,
} from "@/components/games-provider";
import { getTopScores, formatScoreTime } from "@/lib/scores";
import { getTopReactions } from "@/lib/reactions";
import { getTopSoc } from "@/lib/soc";
import { medal } from "@/lib/medals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboards | Microsoft EMS Community Summit",
  description: "Top scores for the MS EMS Community games.",
};

interface Row {
  name: string;
  avatar?: string | null;
  value: string;
}

const PLAY_BTN =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/10";

function Board({
  title,
  icon,
  rows,
  empty,
  play,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Row[];
  empty: string;
  play: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {icon}
          {title}
        </h2>
        {play}
      </div>
      {rows.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {rows.map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                i < 3
                  ? "border-brand-pink/30 bg-brand-pink/[0.06]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {i < 3 ? (
                <span
                  className="w-7 shrink-0 text-center text-xl"
                  aria-label={`Rank ${i + 1}`}
                >
                  {medal(i + 1)}
                </span>
              ) : (
                <span className="w-7 shrink-0 text-center text-lg font-bold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
              )}
              {s.avatar ? (
                <Image
                  src={s.avatar}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full"
                  unoptimized
                />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-semibold text-muted-foreground">
                  {s.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="flex-1 truncate text-sm font-medium">
                {s.name}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {s.value}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  );
}

export default async function LeaderboardPage() {
  const [memory, reactions, soc] = await Promise.all([
    getTopScores(100),
    getTopReactions(100),
    getTopSoc(100),
  ]);

  const memoryRows: Row[] = memory.map((s) => ({
    name: s.name,
    avatar: s.avatar,
    value: `${s.moves} moves · ${formatScoreTime(s.time_seconds)}`,
  }));
  const reactionRows: Row[] = reactions.map((s) => ({
    name: s.name,
    avatar: s.avatar,
    value: `${s.best_ms} ms`,
  }));
  const socRows: Row[] = soc.map((s) => ({
    name: s.name,
    avatar: s.avatar,
    value: `${s.best_score} pts`,
  }));

  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl brand-gradient-bg">
            <Trophy className="size-7 text-white" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Leaderboards
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Two ways to compete. Find the games in the footer or the menu, log
            in with Discord, and climb the boards.
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <Board
            title="Memory match"
            icon={<Gamepad2 className="size-5 text-brand-pink" />}
            rows={memoryRows}
            empty="No scores yet, be the first to win!"
            play={<GameLauncher className={PLAY_BTN} label="Play" />}
          />
          <Board
            title="Patch the Threat"
            icon={<Zap className="size-5 text-brand-pink" />}
            rows={reactionRows}
            empty="No times yet, set the first one!"
            play={<PatchLauncher className={PLAY_BTN} label="Play" />}
          />
          <Board
            title="Defender SOC"
            icon={<ShieldCheck className="size-5 text-brand-pink" />}
            rows={socRows}
            empty="No shifts logged yet, set the first score!"
            play={<SocLauncher className={PLAY_BTN} label="Play" />}
          />
        </div>

        <div className="mt-12 text-center">
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
