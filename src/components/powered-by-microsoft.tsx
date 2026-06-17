interface MicrosoftMarkProps {
  size?: number;
}

/** The Microsoft four-square mark, inlined to avoid the SVG image optimizer. */
function MicrosoftMark({ size = 20 }: MicrosoftMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 23 23"
      role="img"
      aria-label="Microsoft"
      className="shrink-0"
    >
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

interface PoweredByMicrosoftProps {
  /** Compact pill (hero) vs. full bar with supporting text. */
  variant?: "pill" | "bar";
  className?: string;
}

/**
 * Visual "Powered by Microsoft" credit. Microsoft hosts the event at their
 * Denmark office. This is a host/venue credit, not a claim of affiliation
 * (see the disclaimer in the footer).
 */
export function PoweredByMicrosoft({
  variant = "pill",
  className = "",
}: PoweredByMicrosoftProps) {
  if (variant === "bar") {
    return (
      <div
        className={`flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center sm:flex-row sm:gap-4 sm:text-left ${className}`}
      >
        <MicrosoftMark size={40} />
        <div>
          <p className="font-semibold">
            Powered by{" "}
            <span className="font-semibold text-foreground">Microsoft</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Microsoft kindly hosts the community at their office near
            Copenhagen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm ${className}`}
    >
      <MicrosoftMark size={18} />
      <span className="text-muted-foreground">
        Powered by <span className="font-medium text-foreground">Microsoft</span>
      </span>
    </span>
  );
}
