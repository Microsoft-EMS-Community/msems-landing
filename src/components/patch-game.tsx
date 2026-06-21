"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, RotateCcw, ShieldAlert, Trophy, X, Zap } from "lucide-react";
import { useAuthUser, loginHref } from "@/components/use-auth-user";
import { startGame } from "@/lib/start-game";
import { MEDALS } from "@/lib/medals";

const ROUNDS = 6;
const CELLS = 9; // 3x3 grid

type Phase = "waiting" | "active" | "done";

interface Reaction {
  name: string;
  best_ms: number;
  avatar?: string | null;
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127.14 96.36" fill="currentColor" className={className} aria-hidden="true">
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  );
}

export function PatchGame({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuthUser();
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [targetCell, setTargetCell] = useState<number | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [tooSoon, setTooSoon] = useState(false);
  const [board, setBoard] = useState<Reaction[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [improved, setImproved] = useState(true);
  const [rank, setRank] = useState(0);

  const timerRef = useRef<number | null>(null);
  const showAtRef = useRef<number>(0);
  const savedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  const avg = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/reaction", { cache: "no-store" });
      const data: { scores?: Reaction[] } = await res.json();
      setBoard(Array.isArray(data.scores) ? data.scores : []);
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBoard();
  }, [loadBoard]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Clear any pending timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const armNextTarget = useCallback(() => {
    setTargetCell(null);
    setPhase("waiting");
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = 700 + Math.random() * 1300;
    timerRef.current = window.setTimeout(() => {
      setTargetCell(Math.floor(Math.random() * CELLS));
      showAtRef.current = performance.now();
      setPhase("active");
    }, delay);
  }, []);

  // Submit the average once the run completes.
  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    savedRef.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ms: avg, token: tokenRef.current }),
        });
        if (res.ok) {
          const data: { improved?: boolean; rank?: number } = await res.json();
          setImproved(data.improved !== false);
          setRank(typeof data.rank === "number" ? data.rank : 0);
          setSubmitted(true);
          await loadBoard();
        }
      } catch {
        // best-effort
      }
    })();
  }, [phase, avg, loadBoard]);

  async function play() {
    if (!user) return;
    tokenRef.current = await startGame("reaction");
    savedRef.current = false;
    setTimes([]);
    setLastMs(null);
    setTooSoon(false);
    setSubmitted(false);
    setImproved(true);
    setRank(0);
    setStarted(true);
    armNextTarget();
  }

  function handleCell(i: number) {
    if (phase === "waiting") {
      // Tapped before the threat appeared.
      setTooSoon(true);
      armNextTarget();
      return;
    }
    if (phase !== "active" || i !== targetCell) return;

    // performance.now() is read here in a click handler (not during render),
    // which is exactly when measuring reaction time is correct.
    // eslint-disable-next-line react-hooks/purity
    const dt = Math.round(performance.now() - showAtRef.current);
    setTooSoon(false);
    setLastMs(dt);
    setTargetCell(null);
    const next = [...times, dt];
    setTimes(next);
    if (next.length >= ROUNDS) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("done");
    } else {
      armNextTarget();
    }
  }

  const leaderboard = (
    <div className="mt-4">
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Trophy className="size-3.5 text-brand-pink" />
        Fastest reactions
      </h3>
      {board.length > 0 ? (
        <ol className="mt-2 space-y-1">
          {board.slice(0, 5).map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5 text-sm"
            >
              <span className="truncate">
                <span className="text-muted-foreground">
                  {i < 3 ? MEDALS[i] : `${i + 1}.`}
                </span>{" "}
                {s.name}
              </span>
              <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
                {s.best_ms} ms
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No times yet, set the first one!
        </p>
      )}
      <a
        href="/leaderboard"
        className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
      >
        See full leaderboard →
      </a>
    </div>
  );

  const startScreen = (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground">
        Six threats will flash on the grid. Tap each one the instant it appears.
        Your score is the average reaction time, so the lowest wins. Don&apos;t
        jump early.
      </p>

      {user === undefined ? (
        <div className="mt-3 h-11 animate-pulse rounded-xl bg-white/5" />
      ) : user ? (
        <>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
            <span className="truncate">
              Playing as{" "}
              <span className="font-semibold text-foreground">
                {user.username}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="ml-2 inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-3.5" />
              Log out
            </button>
          </div>
          <button
            type="button"
            onClick={play}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient-bg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Zap className="size-4" />
            Start
          </button>
        </>
      ) : (
        <a
          href={loginHref("#patch")}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <DiscordIcon className="size-4" />
          Log in with Discord to play
        </a>
      )}

      {leaderboard}
    </div>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Patch the Threat reaction game"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-white/10 bg-card p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Zap className="size-5 text-brand-pink" />
            Patch the Threat
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close game"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {!started ? (
          startScreen
        ) : phase === "done" ? (
          <>
            <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-center text-sm">
              <div className="text-4xl">
                {rank >= 1 && rank <= 3 ? MEDALS[rank - 1] : "⚡"}
              </div>
              <p className="mt-1 font-semibold text-amber-300">
                {avg} ms average
              </p>
              {submitted && rank >= 1 && (
                <p className="mt-1 font-medium text-foreground">
                  {rank === 1
                    ? "You're #1 on the leaderboard!"
                    : `You're #${rank} on the leaderboard`}
                </p>
              )}
              <p className="mt-1 text-muted-foreground">
                {!submitted
                  ? "Saving your time…"
                  : improved
                    ? `Saved as ${user?.username ?? "you"}.`
                    : "Not your best run, so your top time stands."}
              </p>
            </div>
            <button
              type="button"
              onClick={play}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
              Play again
            </button>
            {leaderboard}
          </>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
              <span>
                Threat{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(times.length + 1, ROUNDS)}
                </span>
                /{ROUNDS}
              </span>
              <span>
                Last{" "}
                <span className="font-mono font-semibold text-foreground">
                  {lastMs !== null ? `${lastMs} ms` : "-"}
                </span>
              </span>
              <span className="text-muted-foreground">
                Avg {times.length ? `${avg} ms` : "-"}
              </span>
            </div>

            <p
              className={`mt-3 text-center text-sm ${
                tooSoon ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {tooSoon
                ? "Too soon! Wait for the threat."
                : phase === "active"
                  ? "Tap it!"
                  : "Get ready…"}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {Array.from({ length: CELLS }, (_, i) => {
                const isTarget = phase === "active" && targetCell === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCell(i)}
                    aria-label={isTarget ? "Threat, tap now" : "Empty cell"}
                    className={`grid aspect-square place-items-center rounded-xl border transition-colors ${
                      isTarget
                        ? "animate-pulse border-red-400 bg-red-500/80 text-white"
                        : "border-white/10 bg-white/5 text-white/15"
                    }`}
                  >
                    <ShieldAlert
                      className={`size-7 ${isTarget ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
