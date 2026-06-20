/** The early-bird SVG, reused by the hero flight and the perched mascot. */
export function Bird({
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
