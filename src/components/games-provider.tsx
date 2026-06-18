"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Gamepad2, ShieldCheck, Zap } from "lucide-react";
import { MemoryGame } from "@/components/memory-game";
import { PatchGame } from "@/components/patch-game";
import { SocGame } from "@/components/soc-game";
import { GamesChooser } from "@/components/games-chooser";

type GameName = "memory" | "patch" | "soc";
type OpenState = GameName | "chooser" | null;

interface GamesContextValue {
  openGame: (game: GameName) => void;
  openChooser: () => void;
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
  const [open, setOpen] = useState<OpenState>(null);

  const openGame = useCallback((game: GameName) => setOpen(game), []);
  const openChooser = useCallback(() => setOpen("chooser"), []);
  const closeGame = useCallback(() => setOpen(null), []);

  // Reopen the right game after a Discord login round-trip (#play / #patch).
  useEffect(() => {
    const hash = window.location.hash;
    const game: GameName | null =
      hash === "#play"
        ? "memory"
        : hash === "#patch"
          ? "patch"
          : hash === "#soc"
            ? "soc"
            : null;
    if (!game) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(game);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return (
    <GamesContext.Provider value={{ openGame, openChooser, closeGame }}>
      {children}
      {open === "chooser" && (
        <GamesChooser onPick={openGame} onClose={closeGame} />
      )}
      {open === "memory" && <MemoryGame onClose={closeGame} />}
      {open === "patch" && <PatchGame onClose={closeGame} />}
      {open === "soc" && <SocGame onClose={closeGame} />}
    </GamesContext.Provider>
  );
}

interface LauncherProps {
  className?: string;
  onOpen?: () => void;
  /** Visible label; pass null for an icon-only button. */
  label?: string | null;
  /** Override the leading icon (e.g. the gradient gamepad). */
  icon?: ReactNode;
}

/** Gamepad glyph stroked with the brand gradient (for the play launchers). */
export function GamepadGradient({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#emsPad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="emsPad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2e88" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <line x1="6" x2="10" y1="11" y2="11" />
      <line x1="8" x2="8" y1="9" y2="13" />
      <line x1="15" x2="15.01" y1="12" y2="12" />
      <line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}

const defaultLauncherClass =
  "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

/** Single entry point: opens a picker to choose which game to play. */
export function GamesLauncher({
  className,
  onOpen,
  label = "Play a game",
  icon,
}: LauncherProps) {
  const { openChooser } = useGames();
  return (
    <button
      type="button"
      aria-label="Play a game"
      onClick={() => {
        openChooser();
        onOpen?.();
      }}
      className={className ?? defaultLauncherClass}
    >
      {icon ?? <Gamepad2 className="size-4" />}
      {label}
    </button>
  );
}

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

/** Opens the Defender SOC triage game. */
export function SocLauncher({
  className,
  onOpen,
  label = "Defender SOC",
}: LauncherProps) {
  const { openGame } = useGames();
  return (
    <button
      type="button"
      aria-label="Play Defender SOC"
      onClick={() => {
        openGame("soc");
        onOpen?.();
      }}
      className={className ?? defaultLauncherClass}
    >
      <ShieldCheck className="size-4" />
      {label}
    </button>
  );
}
