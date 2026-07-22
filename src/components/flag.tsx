// Inline SVG flags — emoji flags don't render on Windows, so we draw them.

const CLS =
  "inline-block h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/15";

/** A small country flag, or nothing when we don't have one drawn. */
export function Flag({ country }: { country: string }) {
  switch (country) {
    case "Denmark":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={CLS} role="img" aria-label="Denmark">
          <rect width="28" height="20" fill="#c8102e" />
          <rect y="8" width="28" height="4" fill="#fff" />
          <rect x="9" width="4" height="20" fill="#fff" />
        </svg>
      );
    case "Netherlands":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={CLS} role="img" aria-label="Netherlands">
          <rect width="28" height="20" fill="#21468b" />
          <rect width="28" height="13.34" fill="#fff" />
          <rect width="28" height="6.67" fill="#ae1c28" />
        </svg>
      );
    // Nordic cross on the 22x16 official construction: 6/1/2/1/12 across,
    // 6/1/2/1/6 down. The white cross is drawn first, the blue over it.
    case "Norway":
      return (
        <svg viewBox="0 0 22 16" preserveAspectRatio="none" className={CLS} role="img" aria-label="Norway">
          <rect width="22" height="16" fill="#ba0c2f" />
          <rect x="6" width="4" height="16" fill="#fff" />
          <rect y="6" width="22" height="4" fill="#fff" />
          <rect x="7" width="2" height="16" fill="#00205b" />
          <rect y="7" width="22" height="2" fill="#00205b" />
        </svg>
      );
    case "Greece":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={CLS} role="img" aria-label="Greece">
          <rect width="28" height="20" fill="#0d5eaf" />
          <rect y="2.22" width="28" height="2.22" fill="#fff" />
          <rect y="6.67" width="28" height="2.22" fill="#fff" />
          <rect y="11.11" width="28" height="2.22" fill="#fff" />
          <rect y="15.56" width="28" height="2.22" fill="#fff" />
          <rect width="11.11" height="11.11" fill="#0d5eaf" />
          <rect x="4.45" width="2.22" height="11.11" fill="#fff" />
          <rect y="4.45" width="11.11" height="2.22" fill="#fff" />
        </svg>
      );
    // Swiss cross, centered. The flag is square; drawn into the 28x20 box like
    // the others, the arms stay symmetric enough at flag size.
    case "Switzerland":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={CLS} role="img" aria-label="Switzerland">
          <rect width="28" height="20" fill="#d52b1e" />
          <rect x="11.5" y="4" width="5" height="12" fill="#fff" />
          <rect x="8" y="7.5" width="12" height="5" fill="#fff" />
        </svg>
      );
    case "United Kingdom":
      return (
        <svg viewBox="0 0 60 30" preserveAspectRatio="none" className={CLS} role="img" aria-label="United Kingdom">
          <clipPath id="uk-s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="uk-t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#uk-s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#c8102e" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
