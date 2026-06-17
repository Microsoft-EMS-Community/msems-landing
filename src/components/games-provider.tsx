"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Gamepad2, Zap } from "lucide-react";
import { MemoryGame } from "@/components/memory-game";
import { PatchGame } from "@/components/patch-game";

type GameName = "memory" | "patch";

interface GamesContextValue {
  openGame: (game: GameName) => void;
  closeGame: () => void;
}

const GamesContext = createContext<GamesContextValue | null>(null);

function useGames(): GamesContextValue {
  const ctx = useContext(GamesContext);
  if (!ctx) throw new Error("useGames must be used within GamesProvider");
  return ctx;
}

/**
 * Hosts the game modals at the app root so they stay mounted no matter which
 * launcher opened them. (A launcher inside the mobile menu would otherwise
 * unmount its modal the instant the menu closed.)
 */
export function GamesProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<GameName | null>(null);

  const openGame = useCallback((game: GameName) => setOpen(game), []);
  const closeGame = useCallback(() => setOpen(null), []);

  // Reopen the right game after a Discord login round-trip (#play / #patch).
  useEffect(() => {
    const hash = window.location.hash;
    const game: GameName | null =
      hash === "#play" ? "memory" : hash === "#patch" ? "patch" : null;
    if (!game) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(game);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return (
    <GamesContext.Provider value={{ openGame, closeGame }}>
      {children}
      {open === "memory" && <MemoryGame onClose={closeGame} />}
      {open === "patch" && <PatchGame onClose={closeGame} />}
    </GamesContext.Provider>
  );
}

interface LauncherProps {
  className?: string;
  onOpen?: () => void;
  /** Visible label; pass null for an icon-only button. */
  label?: string | null;
}

const defaultLauncherClass =
  "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

/** Opens the memory match game. */
export function GameLauncher({
  className,
  onOpen,
  label = "Bored? Play Memory",
}: LauncherProps) {
  const { openGame } = useGames();
  return (
    <button
      type="button"
      aria-label="Play the memory game"
      onClick={() => {
        openGame("memory");
        onOpen?.();
      }}
      className={className ?? defaultLauncherClass}
    >
      <Gamepad2 className="size-4" />
      {label}
    </button>
  );
}

/** Opens the Patch the Threat reaction game. */
export function PatchLauncher({
  className,
  onOpen,
  label = "Patch the Threat",
}: LauncherProps) {
  const { openGame } = useGames();
  return (
    <button
      type="button"
      aria-label="Play Patch the Threat"
      onClick={() => {
        openGame("patch");
        onOpen?.();
      }}
      className={className ?? defaultLauncherClass}
    >
      <Zap className="size-4" />
      {label}
    </button>
  );
}
