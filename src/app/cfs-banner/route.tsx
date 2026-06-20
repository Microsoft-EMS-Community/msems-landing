import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";
import { cardFonts } from "@/lib/og-font";

// A 1280x320 (4:1) "Call for Speakers" banner for the Sessionize CFS header.
// White background so it blends with the Sessionize page.
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
          background: "#ffffff",
          fontFamily: body,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Soft brand wash + accent so the white doesn't read as empty */}
        <div style={{ position: "absolute", right: -120, top: -140, width: 420, height: 420, borderRadius: "50%", background: "linear-gradient(135deg, #ff2e88, #a855f7, #06b6d4)", opacity: 0.14, filter: "blur(70px)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: "linear-gradient(180deg, #ff2e88, #a855f7 50%, #06b6d4)" }} />

        {/* Left: the call */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 860 }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#7c3aed" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", fontFamily: display, fontSize: 66, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, paddingBottom: 4, backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 50%, #0891b2)", backgroundClip: "text", color: "transparent" }}>
            Call for Speakers
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#334155" }}>
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
