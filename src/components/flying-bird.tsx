"use client";

import { useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { Bird } from "@/components/bird";
import { useTickets } from "@/components/tickets-provider";

/**
 * A cute "early bird" that takes off from the early-bird ticket and flaps
 * across the hero. Decorative flight is hidden for reduced-motion users. The
 * dismissible corner mascot lives in PerchedBird (shown on every page).
 */
export function FlyingBird() {
  const openTickets = useTickets();
  const [show, setShow] = useState(false);
  const timer = useRef<number | null>(null);

  function chirp() {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 6000);
  }

  // Open the shared ticket modal, the same action as every other CTA.
  function getTicket() {
    setShow(false);
    openTickets();
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      <button
        type="button"
        onClick={chirp}
        aria-label="Early bird tickets"
        className="bird-fly pointer-events-auto absolute left-0 top-0 w-24 cursor-pointer drop-shadow-[0_8px_18px_rgba(168,85,247,0.5)] hover:[animation-play-state:paused] sm:w-28"
      >
        <Bird flap />
      </button>

      {show && (
        <button
          type="button"
          onClick={getTicket}
          className="pointer-events-auto fixed left-1/2 top-28 z-[60] inline-flex -translate-x-1/2 items-center gap-2 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-2xl"
        >
          <Ticket className="size-4" />
          You caught the early bird! Grab your ticket before they fly →
        </button>
      )}
    </div>
  );
}
