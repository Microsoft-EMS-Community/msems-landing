/**
 * A playful "early bird" that flaps across the hero (a nod to the early-bird
 * tickets). Pure CSS, decorative, and hidden for reduced-motion users.
 */
export function FlyingBird() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      <svg
        viewBox="0 0 80 60"
        className="bird-fly absolute left-0 top-[14%] w-28 drop-shadow-[0_8px_18px_rgba(168,85,247,0.5)] sm:w-36"
      >
        <defs>
          <linearGradient
            id="birdGrad"
            x1="0"
            y1="0"
            x2="80"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ff2e88" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {/* tail */}
        <polygon points="18,36 2,30 13,45" fill="url(#birdGrad)" />
        {/* body */}
        <ellipse cx="36" cy="36" rx="18" ry="11" fill="url(#birdGrad)" />
        {/* head */}
        <circle cx="55" cy="28" r="9" fill="url(#birdGrad)" />
        {/* beak */}
        <polygon points="63,27 80,24 64,34" fill="#f59e0b" />
        {/* eye */}
        <circle cx="57" cy="25" r="2.4" fill="#fff" />
        <circle cx="57.8" cy="25" r="1.1" fill="#0f0a1e" />
        {/* flapping wing */}
        <path
          className="bird-flap"
          d="M34 30 Q46 2 62 14 Q46 22 34 32 Z"
          fill="url(#birdGrad)"
        />
      </svg>
    </div>
  );
}
