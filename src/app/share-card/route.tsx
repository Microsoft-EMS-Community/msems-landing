import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT, COMMUNITY } from "@/lib/event";
import { SHARE_LINK } from "@/lib/share";
import { cardFonts } from "@/lib/og-font";

// A 1200x630 branded share graphic, generated on the fly. Used as the page's
// social preview image and offered as a download on the /share page.
export const dynamic = "force-static";

// Microsoft four-square mark drawn with divs (satori has no SVG <rect>).
function MicrosoftMark() {
  const squares = ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: 28, height: 28, gap: 2 }}>
      {squares.map((color) => (
        <div key={color} style={{ width: 13, height: 13, background: color }} />
      ))}
    </div>
  );
}

export async function GET() {
  // Embed the community logo as a data URI (satori cannot fetch local files).
  const logoBytes = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;
  const shareLabel = SHARE_LINK.replace(/^https?:\/\//, "");

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
          padding: "82px 112px",
          background:
            "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
        }}
      >
        {/* Aurora glow accents */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#ff2e88",
            opacity: 0.35,
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "#06b6d4",
            opacity: 0.3,
            filter: "blur(120px)",
          }}
        />

        {/* Top: logo + community name */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={64}
            height={64}
            style={{ borderRadius: 14 }}
            alt=""
          />
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#e879c9",
            }}
          >
            {COMMUNITY.name}
          </div>
        </div>

        {/* Middle: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontFamily: display,
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2,
            }}
          >
            The community,
          </div>
          <div
            style={{
              fontFamily: display,
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -2,
              backgroundImage:
                "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            in real life.
          </div>
        </div>

        {/* Bottom: date + location, then powered-by + link */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 44, fontSize: 27 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#94a3b8", fontSize: 18 }}>WHEN</span>
              <span style={{ fontWeight: 700 }}>{EVENT.dateLabel}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#94a3b8", fontSize: 18 }}>WHERE</span>
              <span style={{ fontWeight: 700 }}>
                {EVENT.venue}, {EVENT.venueArea}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: 22,
              fontSize: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MicrosoftMark />
              <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
            </div>
            <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, ...(fonts.length ? { fonts } : {}) },
  );
}
