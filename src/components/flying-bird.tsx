"use client";

import { useRef, useState } from "react";
import { Ticket } from "lucide-react";

/**
 * A cute "early bird" that takes off from the early-bird ticket and flaps
 * across the hero. Click it and it chirps the early-bird offer. Decorative,
 * and hidden for reduced-motion users.
 */
export function FlyingBird() {
  const [show, setShow] = useState(false);
  const timer = useRef<number | null>(null);

  function chirp() {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 6000);
  }

  // Briefly glow the signup form so it's clear where to act.
  function flashSignup() {
    setShow(false);
    const el = document.getElementById("signup-top");
    if (!el) return;
    el.classList.remove("signup-flash");
    void el.offsetWidth; // restart the animation on repeat clicks
    el.classList.add("signup-flash");
    window.setTimeout(() => el.classList.remove("signup-flash"), 2300);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      <button
        type="button"
        onClick={chirp}
        aria-label="Early bird tickets"
        className="bird-fly pointer-events-auto absolute left-0 top-0 w-24 cursor-pointer drop-shadow-[0_8px_18px_rgba(168,85,247,0.5)] hover:[animation-play-state:paused] sm:w-28"
      >
        <svg viewBox="0 0 72 64" className="h-auto w-full">
          <defs>
            <linearGradient id="birdGrad" x1="0" y1="0" x2="72" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff2e88" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* tail */}
          <path d="M18 42 L2 36 L14 50 Z" fill="url(#birdGrad)" />
          {/* body */}
          <ellipse cx="30" cy="42" rx="17" ry="14" fill="url(#birdGrad)" />
          <ellipse cx="27" cy="46" rx="9" ry="7" fill="#ffffff" opacity="0.18" />
          {/* head */}
          <circle cx="48" cy="28" r="14" fill="url(#birdGrad)" />
          {/* little tuft */}
          <path d="M47 14 q3 -8 8 -4 q-3 3 -4 8 z" fill="url(#birdGrad)" />
          {/* cheek blush */}
          <circle cx="43" cy="33" r="3.4" fill="#ff5fa2" opacity="0.55" />
          {/* eye */}
          <circle cx="52" cy="26" r="5" fill="#fff" />
          <circle cx="53.4" cy="26.4" r="2.6" fill="#0f0a1e" />
          <circle cx="52.3" cy="25.2" r="1" fill="#fff" />
          {/* beak */}
          <path d="M61 25 L70 28.5 L61 32 Z" fill="#f59e0b" />
          {/* flapping wing */}
          <path className="bird-flap" d="M28 36 Q40 10 56 22 Q40 30 28 40 Z" fill="url(#birdGrad)" />
        </svg>
      </button>

      {show && (
        <a
          href="#signup-top"
          onClick={flashSignup}
          className="pointer-events-auto fixed left-1/2 top-28 z-[60] inline-flex -translate-x-1/2 items-center gap-2 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-2xl"
        >
          <Ticket className="size-4" />
          You caught the early bird! Get notified before seats fly →
        </a>
      )}
    </div>
  );
}
