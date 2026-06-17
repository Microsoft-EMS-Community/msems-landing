"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Gamepad2, LogOut, RotateCcw, Trophy, X } from "lucide-react";

// Microsoft EMS product faces (6 pairs). The icon files live in
// /public/games — swap them for the official product icons any time.
interface CardFace {
  key: string;
  label: string;
  src: string;
}

const FACES: readonly CardFace[] = [
  { key: "intune", label: "Microsoft Intune", src: "/games/intune.svg" },
  { key: "entra", label: "Microsoft Entra ID", src: "/games/entra.svg" },
  { key: "defender", label: "Microsoft Defender", src: "/games/defender.svg" },
  { key: "purview", label: "Microsoft Purview", src: "/games/purview.svg" },
  { key: "windows", label: "Windows", src: "/games/windows.svg" },
  { key: "azure", label: "Microsoft Azure", src: "/games/azure.svg" },
];

const BEST_KEY = "msems-memory-best";

interface Card {
  id: number;
  face: CardFace;
  flipped: boolean;
  matched: boolean;
}

interface Best {
  moves: number;
  time: number;
}

interface Score {
  name: string;
  moves: number;
  time_seconds: number;
  avatar?: string | null;
}

interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
}

function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function newDeck(): Card[] {
  return shuffle(
    FACES.flatMap((face, i) => [
      { id: i * 2, face, flipped: false, matched: false },
      { id: i * 2 + 1, face, flipped: false, matched: false },
    ]),
  );
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Discord wordmark glyph (lucide has no Discord icon). */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127.14 96.36" fill="currentColor" className={className} aria-hidden="true">
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  );
}

interface GameLauncherProps {
  className?: string;
  onOpen?: () => void;
  /** Visible label; pass null for an icon-only button. */
  label?: string | null;
}

/** A trigger button that opens the memory game modal. */
export function GameLauncher({
  className,
  onOpen,
  label = "Bored? Play Memory",
}: GameLauncherProps) {
  const [open, setOpen] = useState(false);

  // Reopen automatically after a Discord login round-trip (`/path#play`).
  useEffect(() => {
    if (window.location.hash !== "#play") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    onOpen?.();
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [onOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Play the memory game"
        onClick={() => {
          setOpen(true);
          onOpen?.();
        }}
        className={
          className ??
          "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        }
      >
        <Gamepad2 className="size-4" />
        {label}
      </button>
      {open && <MemoryGame onClose={() => setOpen(false)} />}
    </>
  );
}

function MemoryGame({ onClose }: { onClose: () => void }) {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<Card[]>(() => newDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [active, setActive] = useState(false); // timer runs after first flip
  const [best, setBest] = useState<Best | null>(null);
  const [board, setBoard] = useState<Score[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [improved, setImproved] = useState(true);
  // Verified Discord identity (null = logged out, undefined = still checking).
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const savedRef = useRef(false);

  const won = deck.length > 0 && deck.every((c) => c.matched);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/score", { cache: "no-store" });
      const data: { scores?: Score[] } = await res.json();
      setBoard(Array.isArray(data.scores) ? data.scores : []);
    } catch {
      // leaderboard is best-effort
    }
  }, []);

  useEffect(() => {
    // Async fetch; setState resolves after the request, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Who's logged in (verified server-side from the session cookie).
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: AuthUser | null }) => {
        if (alive) setUser(d.user ?? null);
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Load best score once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBest(JSON.parse(raw) as Best);
    } catch {
      // ignore unavailable storage
    }
  }, []);

  // Timer runs once the first card is flipped, until the board is cleared.
  useEffect(() => {
    if (!active || won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active, won]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // On win: save local best and submit the score (identity from the session).
  useEffect(() => {
    if (!won || savedRef.current) return;
    savedRef.current = true;

    const score: Best = { moves, time: seconds };
    setBest((prev) => {
      const better =
        !prev ||
        moves < prev.moves ||
        (moves === prev.moves && seconds < prev.time);
      const next = better ? score : prev;
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    void (async () => {
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moves, time: seconds }),
        });
        if (res.ok) {
          const data: { improved?: boolean } = await res.json();
          setImproved(data.improved !== false);
          setSubmitted(true);
          await loadLeaderboard();
        }
      } catch {
        // best-effort
      }
    })();
  }, [won, moves, seconds, loadLeaderboard]);

  function start() {
    if (!user) return;
    savedRef.current = false;
    setDeck(newDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setLocked(false);
    setActive(false);
    setSubmitted(false);
    setImproved(true);
    setStarted(true);
  }

  function reset() {
    savedRef.current = false;
    setDeck(newDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setLocked(false);
    setActive(false);
    setSubmitted(false);
    setImproved(true);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setStarted(false);
  }

  function flip(id: number) {
    if (locked || won) return;
    const card = deck.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    if (!active) setActive(true); // start the clock on the first flip

    if (flipped.length === 0) {
      setDeck((d) => d.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
      setFlipped([id]);
      return;
    }

    const first = deck.find((c) => c.id === flipped[0]);
    setMoves((m) => m + 1);
    setDeck((d) => d.map((c) => (c.id === id ? { ...c, flipped: true } : c)));

    if (first && first.face.key === card.face.key) {
      setDeck((d) =>
        d.map((c) =>
          c.face.key === card.face.key ? { ...c, matched: true } : c,
        ),
      );
      setFlipped([]);
    } else {
      setFlipped([flipped[0], id]);
      setLocked(true);
      setTimeout(() => {
        setDeck((d) =>
          d.map((c) =>
            c.id === flipped[0] || c.id === id ? { ...c, flipped: false } : c,
          ),
        );
        setFlipped([]);
        setLocked(false);
      }, 750);
    }
  }

  const loginHref =
    typeof window !== "undefined"
      ? `/api/auth/discord?return_to=${encodeURIComponent(window.location.pathname + "#play")}`
      : "/api/auth/discord";

  const leaderboard = (
    <div className="mt-4">
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Trophy className="size-3.5 text-brand-pink" />
        Leaderboard
      </h3>
      {board.length > 0 ? (
        <ol className="mt-2 space-y-1">
          {board.slice(0, 5).map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5 text-sm"
            >
              <span className="truncate">
                <span className="text-muted-foreground">{i + 1}.</span> {s.name}
              </span>
              <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
                {s.moves} / {formatTime(s.time_seconds)}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No scores yet — be the first to win!
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
        Match all six pairs in as few moves as you can. It&apos;s a real
        competition, so scores are tied to your Discord account, one entry each.
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
            onClick={start}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient-bg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Gamepad2 className="size-4" />
            Start game
          </button>
        </>
      ) : (
        <a
          href={loginHref}
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
      aria-label="Memory match game"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-white/10 bg-card p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Gamepad2 className="size-5 text-brand-pink" />
            Memory match
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
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm">
              <span>
                Moves{" "}
                <span className="font-semibold text-foreground">{moves}</span>
              </span>
              <span>
                Time{" "}
                <span className="font-mono font-semibold text-foreground">
                  {formatTime(seconds)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Best: {best ? `${best.moves} / ${formatTime(best.time)}` : "—"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2.5">
              {deck.map((card) => {
                const shown = card.flipped || card.matched;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => flip(card.id)}
                    aria-label={shown ? card.face.label : "Hidden card"}
                    className="aspect-square [perspective:600px]"
                  >
                    <div
                      className={`relative h-full w-full rounded-xl transition-transform duration-300 [transform-style:preserve-3d] ${
                        shown ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      <div className="absolute inset-0 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground [backface-visibility:hidden]">
                        <span className="text-lg font-bold">?</span>
                      </div>
                      <div
                        className={`absolute inset-0 grid place-items-center rounded-xl bg-white p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                          card.matched ? "ring-2 ring-brand-pink" : ""
                        }`}
                      >
                        {/* Only render the face when revealed, so the board
                            can't be solved by peeking at the DOM. */}
                        {shown ? (
                          <Image
                            src={card.face.src}
                            alt={card.face.label}
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {won ? (
              <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-center text-sm">
                <div className="text-4xl">🥇</div>
                <p className="mt-1 font-semibold text-amber-300">
                  Solved! {moves} moves · {formatTime(seconds)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {!submitted
                    ? "Saving your score…"
                    : improved
                      ? `Saved to the leaderboard as ${user?.username ?? "you"}.`
                      : "Not your best run, so your top score stands."}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <RotateCcw className="size-4" />
              {won ? "Play again" : "Restart"}
            </button>

            {leaderboard}
          </>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
