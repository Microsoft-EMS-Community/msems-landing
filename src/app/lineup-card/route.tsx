import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import {
  EVENT,
  COMMUNITY,
  SPEAKERS,
  isMvpSpeaker,
  openSpeakerSlots,
  type Speaker,
} from "@/lib/event";
import { SHARE_LINK } from "@/lib/share";
import { resolvePhoto } from "@/lib/card-photo";
import { TOPIC_MAX_CHARS, topicFontSize } from "@/lib/card-text";
import { cardFonts } from "@/lib/og-font";
import { getSessionizeSpeakers } from "@/lib/sessionize";

// A 1080x1350 "the lineup" card: every confirmed speaker on ONE image, for the
// group announcement post (the individual reveal card lives at /announce-card).
// Speakers come from Sessionize, with the hand-kept SPEAKERS as the fallback.
//   ?sessions=0   drop the session titles, names and roles only
//   ?headline=    override the headline
export const dynamic = "force-dynamic";

/** Past this the rows stop being legible; the rest are summarised as "+N more". */
const MAX_ROWS = 8;

const CARD_WIDTH = 1080;
const CARD_PAD = 56;
/** Between the avatar and the text column inside a row. */
const ROW_GAP = 26;
/** Between the session bullet and the session title. */
const BULLET = 9;
const BULLET_GAP = 12;

interface RowLayout {
  /** Diameter of the avatar, including its gradient ring. */
  readonly avatar: number;
  readonly pad: number;
  readonly gap: number;
  readonly name: number;
  readonly tagline: number;
  readonly session: number;
  readonly showSession: boolean;
}

/**
 * Rows are stacked, so the card scales by shrinking them as the lineup grows.
 * Session titles are the first thing to go: past four speakers they no longer
 * fit at a size anyone can read in a feed.
 */
function layoutFor(count: number): RowLayout {
  if (count <= 3)
    return { avatar: 168, pad: 24, gap: 26, name: 38, tagline: 22, session: 25, showSession: true };
  if (count === 4)
    return { avatar: 132, pad: 20, gap: 22, name: 32, tagline: 20, session: 22, showSession: true };
  if (count <= 6)
    return { avatar: 96, pad: 14, gap: 16, name: 28, tagline: 19, session: 20, showSession: false };
  return { avatar: 76, pad: 10, gap: 12, name: 24, tagline: 17, session: 18, showSession: false };
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
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

interface RowProps {
  readonly speaker: Speaker;
  readonly photo: string | null;
  readonly layout: RowLayout;
  readonly mvpSrc: string;
  readonly display: string;
}

function SpeakerRow({ speaker, photo, layout, mvpSrc, display }: RowProps) {
  const session = speaker.session?.slice(0, TOPIC_MAX_CHARS);
  const inner = layout.avatar - 10;
  // Satori will not shrink a flex child to fit, so the text column gets an
  // explicit width. Without it, long session titles run off the card edge.
  const rowInner = CARD_WIDTH - 2 * CARD_PAD - 2 * (layout.pad + 6) - 2;
  const textWidth = rowInner - layout.avatar - ROW_GAP;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: ROW_GAP,
        width: "100%",
        padding: `${layout.pad}px ${layout.pad + 6}px`,
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          width: layout.avatar,
          height: layout.avatar,
          borderRadius: "50%",
          padding: 5,
          background: "linear-gradient(135deg, #ff2e88, #a855f7 50%, #22d3ee)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#120c22",
            color: "#e879c9",
            fontFamily: display,
            fontSize: Math.round(layout.avatar * 0.32),
            fontWeight: 700,
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              width={inner}
              height={inner}
              style={{ objectFit: "cover", borderRadius: "50%" }}
              alt=""
            />
          ) : (
            initials(speaker.name)
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: textWidth, gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              fontFamily: display,
              fontSize: layout.name,
              fontWeight: 800,
              letterSpacing: -0.5,
            }}
          >
            {speaker.name}
          </div>
          {isMvpSpeaker(speaker) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mvpSrc}
              width={Math.round(layout.name * 0.8)}
              height={Math.round(layout.name * 0.8)}
              style={{ borderRadius: 4 }}
              alt=""
            />
          ) : null}
        </div>

        {speaker.title ? (
          <div style={{ display: "flex", width: textWidth, fontSize: layout.tagline, lineHeight: 1.3, color: "#94a3b8" }}>
            {speaker.title}
          </div>
        ) : null}

        {layout.showSession && session ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: BULLET_GAP, marginTop: 4 }}>
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                width: BULLET,
                height: BULLET,
                borderRadius: "50%",
                marginTop: Math.round(layout.session * 0.45),
                background: "#ff2e88",
              }}
            />
            <div
              style={{
                display: "flex",
                width: textWidth - BULLET - BULLET_GAP,
                fontSize: topicFontSize(session, layout.session),
                lineHeight: 1.3,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              {session}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function renderCard(speakers: readonly Speaker[], withSessions: boolean, headlineRaw: string) {
  const shown = speakers.slice(0, MAX_ROWS);
  const overflow = speakers.length - shown.length;
  const base = layoutFor(shown.length);
  const layout: RowLayout = { ...base, showSession: base.showSession && withSessions };

  const [photos, logoBytes, mvpBytes, fonts] = await Promise.all([
    Promise.all(shown.map((s) => resolvePhoto(s.photo ?? null))),
    readFile(join(process.cwd(), "public", "logo.png")),
    readFile(join(process.cwd(), "public", "mvp-badge.png")),
    cardFonts(),
  ]);
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const mvpSrc = `data:image/png;base64,${mvpBytes.toString("base64")}`;
  const shareLabel = SHARE_LINK.replace(/^https?:\/\//, "");

  const body = fonts.length ? "Inter" : "sans-serif";
  const display = fonts.length ? "Space Grotesk" : "sans-serif";

  const open = openSpeakerSlots(speakers.length);
  const headline =
    headlineRaw.trim().slice(0, 40) || (open > 0 ? "First speakers announced" : "Meet your speakers");
  const note =
    overflow > 0
      ? `And ${overflow} more speaker${overflow === 1 ? "" : "s"} on the day`
      : open > 0
        ? `${open} more session${open === 1 ? "" : "s"} still to be announced`
        : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 56px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -160, left: -120, width: 520, height: 520, borderRadius: "50%", background: "#ff2e88", opacity: 0.32, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -180, right: -120, width: 520, height: 520, borderRadius: "50%", background: "#06b6d4", opacity: 0.28, filter: "blur(120px)" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={48} height={48} style={{ borderRadius: 11 }} alt="" />
            <div style={{ display: "flex", fontSize: 20, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
              {COMMUNITY.name}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: display,
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1,
              textAlign: "center",
              backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {headline}
          </div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#e2e8f0", textAlign: "center" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#94a3b8", textAlign: "center" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: layout.gap }}>
          {shown.map((s, i) => (
            <SpeakerRow
              key={s.name}
              speaker={s}
              photo={photos[i]}
              layout={layout}
              mvpSrc={mvpSrc}
              display={display}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
          {note ? (
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 1, color: "#cbd5e1" }}>{note}</div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20, fontSize: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MicrosoftMark />
              <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
            </div>
            <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, ...(fonts.length ? { fonts } : {}) },
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const live = await getSessionizeSpeakers();
  const speakers = live.length > 0 ? live : SPEAKERS;
  if (speakers.length === 0) {
    return new Response("No speakers announced yet", { status: 404 });
  }
  return renderCard(speakers, sp.get("sessions") !== "0", sp.get("headline") ?? "");
}
