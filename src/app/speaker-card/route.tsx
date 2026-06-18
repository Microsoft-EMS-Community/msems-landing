import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { EVENT, COMMUNITY } from "@/lib/event";
import { SHARE_LINK } from "@/lib/share";
import { resolvePhoto } from "@/lib/card-photo";
import { cardFonts } from "@/lib/og-font";

// A 1080x1350 "I'm speaking at" card.
//  - No name: a generic template with a "Your photo" ring (fill in Canva).
//  - name/topic/photo (GET query or POST body, photo can be data: or https URL):
//    a personalised card.
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

async function renderCard(nameRaw: string, topicRaw: string, photoRaw: string | null) {
  const name = nameRaw.trim().slice(0, 40);
  const topic = topicRaw.trim().slice(0, 90);
  const photoSrc = await resolvePhoto(photoRaw);
  const personalised = Boolean(name);

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
          alignItems: "center",
          justifyContent: "space-between",
          padding: "104px 64px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: body,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -160, left: -120, width: 520, height: 520, borderRadius: "50%", background: "#ff2e88", opacity: 0.32, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -180, right: -120, width: 520, height: 520, borderRadius: "50%", background: "#06b6d4", opacity: 0.28, filter: "blur(120px)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={56} height={56} style={{ borderRadius: 12 }} alt="" />
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
            {COMMUNITY.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 232, height: 232, borderRadius: "50%", padding: 6, background: "linear-gradient(135deg, #ff2e88, #a855f7 50%, #22d3ee)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#120c22", color: "#8b93a7", fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} width={220} height={220} style={{ objectFit: "cover", borderRadius: "50%" }} alt="" />
              ) : (
                "Your photo"
              )}
            </div>
          </div>

          {personalised ? (
            <>
              <div style={{ display: "flex", fontFamily: display, maxWidth: 880, fontSize: 56, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, textAlign: "center" }}>
                {name}
              </div>
              <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#cbd5e1" }}>
                Speaking at
              </div>
            </>
          ) : (
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", color: "#cbd5e1" }}>
              {"I'm speaking at"}
            </div>
          )}

          <div style={{ display: "flex", fontFamily: display, maxWidth: 880, fontSize: personalised ? 44 : 62, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, textAlign: "center", backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            {EVENT.name}
          </div>

          {personalised && topic ? (
            <div style={{ display: "flex", maxWidth: 820, fontSize: 28, color: "#e2e8f0", textAlign: "center" }}>
              {topic}
            </div>
          ) : (
            <div style={{ display: "flex", maxWidth: 820, fontSize: 30, color: "#e2e8f0", textAlign: "center" }}>
              {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 24, fontSize: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MicrosoftMark />
            <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
          </div>
          <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, ...(fonts.length ? { fonts } : {}) },
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return renderCard(sp.get("name") ?? "", sp.get("topic") ?? "", sp.get("photo"));
}

interface CardBody {
  name?: unknown;
  topic?: unknown;
  photo?: unknown;
}

export async function POST(request: Request) {
  let body: CardBody;
  try {
    body = (await request.json()) as CardBody;
  } catch {
    body = {};
  }
  const name = typeof body.name === "string" ? body.name : "";
  const topic = typeof body.topic === "string" ? body.topic : "";
  const photo = typeof body.photo === "string" ? body.photo : null;
  return renderCard(name, topic, photo);
}
