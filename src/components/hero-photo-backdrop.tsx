"use client";

import { useEffect, useState } from "react";

// Real Copenhagen "moments" that slowly crossfade behind the hero.
// Drop new photos into /public/location and add them here to rotate them in.
const PHOTOS: ReadonlyArray<string> = [
  "/location/copenhagen.avif",
  "/location/nyhavn.webp",
  "/location/tivoli.avif",
  "/location/microsoft.jpg",
];

const INTERVAL_MS = 6000;

/**
 * A gentle photographic backdrop for the hero: a set of Copenhagen photos that
 * crossfade on a timer, heavily dimmed so the headline and CTA stay readable.
 * Sits behind the aurora glow so the two layer into a "city at night" feel.
 */
export function HeroPhotoBackdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % PHOTOS.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
    >
      {PHOTOS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ease-in-out motion-reduce:transition-none"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
      {/* Dim + brand-dark wash so text stays readable over any photo */}
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/45 to-background" />
    </div>
  );
}
