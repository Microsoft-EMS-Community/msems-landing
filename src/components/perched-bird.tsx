"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Bird } from "@/components/bird";
import { useTickets } from "@/components/tickets-provider";

const DISMISS_KEY = "ems-bird-dismissed";

/**
 * The "early bird" perched in the bottom-right corner, on every page. Appears
 * once you scroll down a little, nudges toward tickets, and is dismissible.
 * Dismissal persists in localStorage, so once hidden it stays hidden across
 * pages and visits. Rendered at the app root so it survives navigation.
 */
export function PerchedBird() {
  const openTickets = useTickets();
  const [perched, setPerched] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume hidden until we read storage
  const announced = useRef(false);

  // Read the persisted dismissal once on mount (client only).
  useEffect(() => {
    let isDismissed = false;
    try {
      isDismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      isDismissed = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(isDismissed);
  }, []);

  // Perch the bird once the page is scrolled a little, with a one-time wave.
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.6;
      setPerched(past);
      if (past && !announced.current) {
        announced.current = true;
        setBubble(true);
        window.setTimeout(() => setBubble(false), 4500);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  if (!perched || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bird-bob group relative">
        {/* Speech bubble: auto-shows once on landing, and on hover */}
        <button
          type="button"
          onClick={openTickets}
          className={`absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 ${
            bubble ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Psst! Grab a ticket →
        </button>
        <button
          type="button"
          onClick={openTickets}
          aria-label="Get your ticket"
          title="Get your ticket"
          className="block w-14 cursor-pointer drop-shadow-[0_8px_18px_rgba(168,85,247,0.45)] transition-transform hover:scale-105 sm:w-16"
        >
          <Bird flap gradId="birdGradPerch" />
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide the early bird"
          className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-white/15 bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
