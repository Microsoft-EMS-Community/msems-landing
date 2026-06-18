import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT, COMMUNITY } from "@/lib/event";
import { SHARE_LINK } from "@/lib/share";

// A 1080x1080 "I'm attending, are you?" card for attendees to post.
export const dynamic = "force-static";

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

export async function GET() {
  const logoBytes = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const shareLabel = SHARE_LINK.replace(/^https?:\/\//, "");

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
          padding: "72px 64px",
          background:
            "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -160, left: -120, width: 520, height: 520, borderRadius: "50%", background: "#ff2e88", opacity: 0.32, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -180, right: -120, width: 520, height: 520, borderRadius: "50%", background: "#06b6d4", opacity: 0.28, filter: "blur(120px)" }} />

        {/* Top: logo + community */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={56} height={56} style={{ borderRadius: 12 }} alt="" />
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
            {COMMUNITY.name}
          </div>
        </div>

        {/* Center: headline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", color: "#cbd5e1" }}>
            {"I'm attending"}
          </div>
          <div style={{ display: "flex", maxWidth: 880, fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1, textAlign: "center", backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", maxWidth: 820, fontSize: 30, color: "#e2e8f0", textAlign: "center" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 40, fontWeight: 800, color: "#f0abfc" }}>
            Are you?
          </div>
        </div>

        {/* Bottom: powered by + link */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 24, fontSize: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MicrosoftMark />
            <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
          </div>
          <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
