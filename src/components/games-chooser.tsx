"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Gamepad2, X, Zap } from "lucide-react";

interface GamesChooserProps {
  onPick: (game: "memory" | "patch") => void;
  onClose: () => void;
}

const OPTIONS = [
  {
    key: "memory" as const,
    icon: Gamepad2,
    title: "Memory match",
    desc: "Match all six pairs in the fewest moves.",
  },
  {
    key: "patch" as const,
    icon: Zap,
    title: "Patch the Threat",
    desc: "Tap each threat the instant it appears. Fastest average wins.",
  },
];

/** A small picker that lets players choose which game to play. */
export function GamesChooser({ onPick, onClose }: GamesChooserProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a game"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-card p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Pick a game</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {OPTIONS.map(({ key, icon: Icon, title, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-brand-pink/40 hover:bg-white/[0.06]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl brand-gradient-bg text-white">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted-foreground">
                  {desc}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
