import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT, COMMUNITY, SITE_URL } from "@/lib/event";
import { cardFonts } from "@/lib/og-font";

// A 1774x444 cover banner for the LinkedIn group/page header.
//   GET /linkedin-cover  -> PNG at the LinkedIn-recommended size.
export const dynamic = "force-dynamic";

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
  const siteLabel = SITE_URL.replace(/^https?:\/\//, "");

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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 72px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -240, left: -140, width: 540, height: 540, borderRadius: "50%", background: "#ff2e88", opacity: 0.30, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -280, right: -140, width: 580, height: 580, borderRadius: "50%", background: "#06b6d4", opacity: 0.26, filter: "blur(120px)" }} />

        {/* Top row: logo + community, status pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={56} height={56} style={{ borderRadius: 12 }} alt="" />
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
              {COMMUNITY.name}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 21, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "10px 24px" }}>
            {EVENT.status}
          </div>
        </div>

        {/* Title + date */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 74, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, paddingBottom: 6, backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            {EVENT.name}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#e2e8f0" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
        </div>

        {/* Bottom row: powered by Microsoft, site URL */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MicrosoftMark />
            <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
          </div>
          <span style={{ fontWeight: 700, color: "#f0abfc" }}>{siteLabel}</span>
        </div>
      </div>
    ),
    { width: 1774, height: 444, ...(fonts.length ? { fonts } : {}) },
  );
}
