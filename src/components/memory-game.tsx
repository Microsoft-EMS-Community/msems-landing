"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Gamepad2, RotateCcw, Trophy, X } from "lucide-react";

// EMS/security-flavoured faces (6 pairs).
const FACES = ["🛡️", "🔐", "☁️", "📱", "🆔", "⚙️"];
const BEST_KEY = "msems-memory-best";
const NAME_KEY = "msems-memory-name";

interface Card {
  id: number;
  face: string;
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
  // Pre-fill the name from a previous play (modal is client-only, no SSR).
  const [name, setName] = useState<string>(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? "";
    } catch {
      return "";
    }
  });
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

  // On win: save local best and auto-submit the score (name entered up front).
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
          body: JSON.stringify({ name: name.trim(), moves, time: seconds }),
        });
        if (res.ok) {
          setSubmitted(true);
          await loadLeaderboard();
        }
      } catch {
        // best-effort
      }
    })();
  }, [won, moves, seconds, name, loadLeaderboard]);

  function start() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {
      // ignore
    }
    savedRef.current = false;
    setDeck(newDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setLocked(false);
    setActive(false);
    setSubmitted(false);
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

    if (first && first.face === card.face) {
      setDeck((d) =>
        d.map((c) => (c.face === card.face ? { ...c, matched: true } : c)),
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
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Match all six pairs in as few moves as you can. Enter your name to
              get on the leaderboard.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") start();
              }}
              maxLength={24}
              placeholder="Your name"
              className="mt-3 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none focus:border-brand-pink/60"
            />
            <button
              type="button"
              onClick={start}
              disabled={!name.trim()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient-bg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Gamepad2 className="size-4" />
              Start game
            </button>
            {leaderboard}
          </div>
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
                    aria-label={shown ? card.face : "Hidden card"}
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
                        className={`absolute inset-0 grid place-items-center rounded-xl text-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                          card.matched
                            ? "brand-gradient-bg"
                            : "border border-brand-pink/40 bg-brand-pink/10"
                        }`}
                      >
                        {/* Only render the face when revealed, so the board
                            can't be solved by peeking at the DOM. */}
                        {shown ? card.face : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {won ? (
              <div className="mt-4 rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-3 text-center text-sm">
                🎉 Cleared in{" "}
                <span className="font-semibold">{moves} moves</span> and{" "}
                {formatTime(seconds)}!
                <p className="mt-1 text-muted-foreground">
                  {submitted
                    ? `Saved to the leaderboard as ${name.trim()}.`
                    : "Saving your score…"}
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
