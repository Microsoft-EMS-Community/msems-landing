import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/event";
import { cardFonts } from "@/lib/og-font";

// A 1774x444 cover banner for the general LinkedIn community group header.
//   GET /linkedin-cover  -> PNG at the LinkedIn-recommended size.
export const dynamic = "force-dynamic";

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

        {/* Bottom row: site URL + independence disclaimer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#f0abfc" }}>{siteLabel}</span>
          <span style={{ fontSize: 18, color: "#8b93a7" }}>
            Independent community, not affiliated with Microsoft
          </span>
        </div>
      </div>
    ),
    { width: 1774, height: 444, ...(fonts.length ? { fonts } : {}) },
  );
}
