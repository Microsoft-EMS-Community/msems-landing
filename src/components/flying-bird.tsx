"use client";

import { useEffect, useRef, useState } from "react";
import { Ticket, X } from "lucide-react";

/** The early-bird SVG, reused by the hero flight and the perched mascot. */
function Bird({
  flap = false,
  gradId = "birdGrad",
}: {
  flap?: boolean;
  gradId?: string;
}) {
  return (
    <svg viewBox="0 0 72 64" className="h-auto w-full">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="72" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2e88" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* tail */}
      <path d="M18 42 L2 36 L14 50 Z" fill={`url(#${gradId})`} />
      {/* body */}
      <ellipse cx="30" cy="42" rx="17" ry="14" fill={`url(#${gradId})`} />
      <ellipse cx="27" cy="46" rx="9" ry="7" fill="#ffffff" opacity="0.18" />
      {/* head */}
      <circle cx="48" cy="28" r="14" fill={`url(#${gradId})`} />
      {/* little tuft */}
      <path d="M47 14 q3 -8 8 -4 q-3 3 -4 8 z" fill={`url(#${gradId})`} />
      {/* cheek blush */}
      <circle cx="43" cy="34" r="3.8" fill="#ff5fa2" opacity="0.6" />
      {/* eye (looking up + bright, happy) */}
      <circle cx="52" cy="26" r="5" fill="#fff" />
      <circle cx="53" cy="25.4" r="2.6" fill="#0f0a1e" />
      <circle cx="53.9" cy="24.3" r="1.3" fill="#fff" />
      {/* smile */}
      <path d="M45 35 q4 4 8.5 1.2" stroke="#0f0a1e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* beak */}
      <path d="M61 24 L70 28 L61 31 Z" fill="#f59e0b" />
      {/* flapping wing */}
      <path className={flap ? "bird-flap" : undefined} d="M28 36 Q40 10 56 22 Q40 30 28 40 Z" fill={`url(#${gradId})`} />
    </svg>
  );
}

/**
 * A cute "early bird" that takes off from the early-bird ticket and flaps
 * across the hero, then perches in the bottom-right corner once you scroll
 * past the hero, as a gentle, dismissible nudge back to the signup form.
 * Decorative flight is hidden for reduced-motion users.
 */
export function FlyingBird() {
  const [show, setShow] = useState(false);
  const [perched, setPerched] = useState(false);
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<number | null>(null);
  const announced = useRef(false);

  // Perch the bird once the hero is scrolled past, and give a one-time wave.
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

  function chirp() {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShow(false), 6000);
  }

  // Send people to the nearest signup form and glow it, without ever scrolling
  // backward: flash the hero form in place if it's still on screen, otherwise
  // scroll down to the final signup and blink that instead.
  function flashSignup() {
    setShow(false);
    const hero = document.getElementById("signup-top");
    const heroPast = hero ? hero.getBoundingClientRect().bottom < 120 : true;
    const target = heroPast
      ? document.getElementById("notify-card")
      : hero;
    if (!target) return;
    if (heroPast) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    target.classList.remove("signup-flash");
    void target.offsetWidth; // restart the animation on repeat clicks
    target.classList.add("signup-flash");
    window.setTimeout(() => target.classList.remove("signup-flash"), 2300);
  }

  return (
    <>
      {/* Decorative hero flight */}
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
            onClick={flashSignup}
            className="pointer-events-auto fixed left-1/2 top-28 z-[60] inline-flex -translate-x-1/2 items-center gap-2 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-2xl"
          >
            <Ticket className="size-4" />
            You caught the early bird! Get notified before seats fly →
          </button>
        )}
      </div>

      {/* Perched mascot — appears after the hero, dismissible */}
      {perched && !dismissed && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bird-bob group relative">
            {/* Speech bubble: auto-shows once on landing, and on hover */}
            <button
              type="button"
              onClick={flashSignup}
              className={`absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-white/10 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 ${
                bubble ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              Psst! Get notified →
            </button>
            <button
              type="button"
              onClick={flashSignup}
              aria-label="Get notified about tickets"
              title="Get notified"
              className="block w-14 cursor-pointer drop-shadow-[0_8px_18px_rgba(168,85,247,0.45)] transition-transform hover:scale-105 sm:w-16"
            >
              <Bird flap gradId="birdGradPerch" />
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Hide the early bird"
              className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-white/15 bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
