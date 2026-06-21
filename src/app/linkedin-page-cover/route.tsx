import { ImageResponse } from "next/og";
import { cardFonts } from "@/lib/og-font";

// A 2256x382 (LinkedIn Company Page cover, 1128x191 @2x) banner. Per LinkedIn
// best practice it's centered (mobile crops the sides), one message, minimal:
// a headline + a single "find us" line (site + Discord). The page name/tagline
// show below, so no name or topic repeat here.
//   GET /linkedin-page-cover  -> PNG
export const dynamic = "force-dynamic";

function Globe() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function Discord() {
  return (
    <svg width="36" height="28" viewBox="0 0 127.14 96.36" fill="#8ea1ff">
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  );
}

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          padding: "0 90px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 80, top: -220, width: 560, height: 560, borderRadius: "50%", background: "#ff2e88", opacity: 0.24, filter: "blur(130px)" }} />
        <div style={{ position: "absolute", right: 80, bottom: -240, width: 600, height: 600, borderRadius: "50%", background: "#06b6d4", opacity: 0.24, filter: "blur(130px)" }} />
        <div style={{ position: "absolute", left: "50%", top: -260, width: 560, height: 560, borderRadius: "50%", background: "#a855f7", opacity: 0.22, filter: "blur(140px)" }} />

        <div style={{ display: "flex", fontFamily: display, fontSize: 54, fontWeight: 800, letterSpacing: -1, paddingBottom: 2, backgroundImage: "linear-gradient(100deg, #ff8ac0, #d8b4fe 45%, #67e8f9)", backgroundClip: "text", color: "transparent" }}>
          Run Microsoft security? So do we.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 48, fontSize: 30, color: "#e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Globe />
            <span>msems.community</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Discord />
            <span>aka.ms/M365EMSDiscord</span>
          </div>
        </div>
      </div>
    ),
    { width: 2256, height: 382, ...(fonts.length ? { fonts } : {}) },
  );
}
