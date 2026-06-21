import { ImageResponse } from "next/og";
import { cardFonts } from "@/lib/og-font";

// A 2256x382 (LinkedIn Company Page cover, 1128x191 @2x) banner. The page name
// shows below the cover, so this is a branded backdrop (no name repeat), and
// content sits to the right so the bottom-left logo never overlaps it.
//   GET /linkedin-page-cover  -> PNG
export const dynamic = "force-dynamic";

export async function GET() {
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
          justifyContent: "flex-end",
          padding: "0 110px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: -160, top: -200, width: 560, height: 560, borderRadius: "50%", background: "#ff2e88", opacity: 0.28, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", right: 200, top: -240, width: 560, height: 560, borderRadius: "50%", background: "#a855f7", opacity: 0.26, filter: "blur(130px)" }} />
        <div style={{ position: "absolute", right: -180, bottom: -240, width: 600, height: 600, borderRadius: "50%", background: "#06b6d4", opacity: 0.26, filter: "blur(130px)" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right", gap: 14, maxWidth: 1500 }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 50, fontWeight: 800, letterSpacing: -1, paddingBottom: 2, backgroundImage: "linear-gradient(100deg, #ff8ac0, #d8b4fe 45%, #67e8f9)", backgroundClip: "text", color: "transparent" }}>
            Real-world Microsoft security & Zero Trust
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#e2e8f0" }}>
            Intune · Entra ID · Conditional Access · Microsoft Defender XDR
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#f0abfc" }}>
            msems.community
          </div>
        </div>
      </div>
    ),
    { width: 2256, height: 382, ...(fonts.length ? { fonts } : {}) },
  );
}
