import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";
import { cardFonts } from "@/lib/og-font";

// A 1280x320 (4:1) banner for the Sessionize CFS header. Sessionize already
// shows a "Call for Speakers" heading above it, so this leads with a speaker
// hook on the brand gradient instead of repeating the title.
//   GET /cfs-banner  -> PNG
export const dynamic = "force-dynamic";

export async function GET() {
  const logoBytes = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  const fonts = await cardFonts();
  const body = fonts.length ? "Inter" : "sans-serif";
  const display = fonts.length ? "Space Grotesk" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Brand-gradient glow in the background */}
        <div style={{ position: "absolute", left: -120, top: -160, width: 460, height: 460, borderRadius: "50%", background: "#ff2e88", opacity: 0.34, filter: "blur(110px)" }} />
        <div style={{ position: "absolute", right: 120, top: -200, width: 460, height: 460, borderRadius: "50%", background: "#a855f7", opacity: 0.30, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", right: -140, bottom: -200, width: 480, height: 480, borderRadius: "50%", background: "#06b6d4", opacity: 0.30, filter: "blur(120px)" }} />

        {/* Left: speaker hook */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 880 }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#f0abfc" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", fontFamily: display, fontSize: 66, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, paddingBottom: 4, backgroundImage: "linear-gradient(100deg, #ff8ac0, #d8b4fe 45%, #67e8f9)", backgroundClip: "text", color: "transparent" }}>
            Take the stage
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#e2e8f0" }}>
            Level 300 talks on the Microsoft security stack
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#94a3b8" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
        </div>

        {/* Right: logo */}
        <div style={{ display: "flex", padding: 5, borderRadius: 34, background: "linear-gradient(135deg, #ff2e88, #a855f7 50%, #22d3ee)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={150} height={150} style={{ borderRadius: 30 }} alt="" />
        </div>
      </div>
    ),
    { width: 1280, height: 320, ...(fonts.length ? { fonts } : {}) },
  );
}
