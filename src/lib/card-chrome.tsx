import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EVENT, COMMUNITY } from "./event";
import { SHARE_LINK } from "./share";
import { nameFontSize, topicFontSize } from "./card-text";
import { cardFonts } from "./og-font";

/**
 * Shared furniture for the 1080x1350 portrait cards (`/speaker-card`,
 * `/announce-card`). Both use the same full-bleed composition so a speaker's
 * self-post and the team's reveal read as the same event; they differ only in
 * the eyebrow label above the name.
 */

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

/** Portrait bleeds to here; the scrim takes over below it. */
const PORTRAIT_HEIGHT = 860;

export const TAGLINE_MAX_CHARS = 70;

type Fonts = Awaited<ReturnType<typeof cardFonts>>;

export interface CardChrome {
  readonly logoSrc: string;
  readonly shareLabel: string;
  readonly body: string;
  readonly display: string;
  readonly fonts: Fonts;
}

/** Loads the logo and fonts once per render. */
export async function loadCardChrome(): Promise<CardChrome> {
  const logoBytes = await readFile(join(process.cwd(), "public", "logo.png"));
  const fonts = await cardFonts();
  return {
    logoSrc: `data:image/png;base64,${logoBytes.toString("base64")}`,
    shareLabel: SHARE_LINK.replace(/^https?:\/\//, ""),
    body: fonts.length ? "Inter" : "sans-serif",
    display: fonts.length ? "Space Grotesk" : "sans-serif",
    fonts,
  };
}

/** ImageResponse options, so routes don't repeat the size + font wiring. */
export function cardImageOptions(chrome: CardChrome) {
  return {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    ...(chrome.fonts.length ? { fonts: chrome.fonts } : {}),
  };
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MicrosoftMark() {
  const squares = ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: 26, height: 26, gap: 2 }}>
      {squares.map((color) => (
        <div key={color} style={{ width: 12, height: 12, background: color }} />
      ))}
    </div>
  );
}

function Footer({ shareLabel }: { shareLabel: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 22, fontSize: 23 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <MicrosoftMark />
        <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
      </div>
      <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
    </div>
  );
}

export interface PortraitCardProps {
  readonly chrome: CardChrome;
  readonly name: string;
  readonly topic: string;
  readonly tagline: string;
  readonly photoSrc: string | null;
  readonly topics: readonly string[];
  /** Small pill above the name, e.g. "Speaker announcement". */
  readonly eyebrow?: string;
}

/**
 * The portrait bleeds off the top edge, a scrim fades it into the brand
 * gradient, and the type stacks in the lower third. Without a photo the same
 * slot becomes a muted brand panel with the speaker's initials, so the layout
 * never collapses.
 */
export function PortraitCard({
  chrome, name, topic, tagline, photoSrc, topics, eyebrow,
}: PortraitCardProps) {
  const { logoSrc, shareLabel, body, display } = chrome;
  return (
    <div
      style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", background: "#0f0a1e",
        color: "#ffffff", fontFamily: body, position: "relative",
      }}
    >
      {photoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoSrc} width={CARD_WIDTH} height={PORTRAIT_HEIGHT} style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }} alt="" />
      ) : (
        // Muted brand gradient, not the full-strength one: it sits under the
        // same scrim as a photo would, and at full saturation it glares.
        <div style={{ position: "absolute", top: 0, left: 0, display: "flex", alignItems: "center", justifyContent: "center", width: CARD_WIDTH, height: PORTRAIT_HEIGHT, background: "linear-gradient(135deg, #5c1038 0%, #3a1f5e 50%, #0f3f4d 100%)", fontFamily: display, fontSize: 210, fontWeight: 800, color: "rgba(255,255,255,0.22)" }}>
          {initials(name)}
        </div>
      )}

      {/* Transparent over the face, solid where the type starts. */}
      <div style={{ position: "absolute", top: 0, left: 0, width: CARD_WIDTH, height: CARD_HEIGHT, background: "linear-gradient(180deg, rgba(15,10,30,0.45) 0%, rgba(15,10,30,0.1) 22%, rgba(15,10,30,0.75) 52%, #12081f 66%, #12081f 100%)" }} />
      <div style={{ position: "absolute", bottom: -180, right: -140, width: 560, height: 560, borderRadius: "50%", background: "#06b6d4", opacity: 0.24, filter: "blur(130px)" }} />

      <div style={{ position: "absolute", top: 56, left: 64, display: "flex", alignItems: "center", gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={48} height={48} style={{ borderRadius: 11 }} alt="" />
        <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
          {COMMUNITY.name}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", padding: "0 64px 56px", gap: 22 }}>
        {eyebrow && (
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", borderRadius: 999, border: "1px solid rgba(255,46,136,0.45)", background: "rgba(255,46,136,0.12)", padding: "9px 22px", fontSize: 21, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#ffa8d2" }}>
              {eyebrow}
            </div>
          </div>
        )}

        <div style={{ display: "flex", fontFamily: display, maxWidth: 950, fontSize: nameFontSize(name, 76), fontWeight: 800, lineHeight: 1.0, letterSpacing: -2 }}>
          {name}
        </div>

        {tagline && (
          <div style={{ display: "flex", maxWidth: 900, fontSize: 25, lineHeight: 1.3, color: "#a5b4c8" }}>
            {tagline}
          </div>
        )}

        {topics.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            {topics.map((t) => (
              <div key={t} style={{ display: "flex", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", padding: "8px 20px", fontSize: 22, color: "#e2e8f0" }}>
                {t}
              </div>
            ))}
          </div>
        )}

        {topic && (
          <div style={{ display: "flex", fontFamily: display, maxWidth: 950, fontSize: topicFontSize(topic, 46), fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, marginTop: 8 }}>
            {topic}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 36, fontWeight: 800, letterSpacing: -0.5, backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", fontSize: 25, color: "#cbd5e1" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 6 }}>
          <Footer shareLabel={shareLabel} />
        </div>
      </div>
    </div>
  );
}
