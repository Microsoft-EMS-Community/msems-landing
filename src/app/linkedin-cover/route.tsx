import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/event";
import { cardFonts } from "@/lib/og-font";

// A 1774x444 cover banner for the general LinkedIn community group header.
//   GET /linkedin-cover  -> PNG at the LinkedIn-recommended size.
export const dynamic = "force-dynamic";

function Globe() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function Discord() {
  return (
    <svg width="32" height="24" viewBox="0 0 127.14 96.36" fill="#8ea1ff">
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
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

        {/* Top row: logo, member-count pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={60} height={60} style={{ borderRadius: 13 }} alt="" />
          <div style={{ display: "flex", alignItems: "center", fontSize: 20, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999, padding: "10px 24px" }}>
            Enterprise Mobility + Security
          </div>
        </div>

        {/* Name + what it covers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", fontFamily: display, fontSize: 76, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, paddingBottom: 6, backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            MS EMS Community
          </div>
          <div style={{ display: "flex", fontSize: 29, color: "#e2e8f0" }}>
            For admins and enthusiasts of Intune, Entra ID and Microsoft Defender XDR
          </div>
        </div>

        {/* Bottom row: find-us links (site + Discord) + independence disclaimer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 24, color: "#e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Globe />
              <span>{siteLabel}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Discord />
              <span>aka.ms/M365EMSDiscord</span>
            </div>
          </div>
          <span style={{ fontSize: 18, color: "#8b93a7" }}>
            Independent community, not affiliated with Microsoft
          </span>
        </div>
      </div>
    ),
    { width: 1774, height: 444, ...(fonts.length ? { fonts } : {}) },
  );
}
