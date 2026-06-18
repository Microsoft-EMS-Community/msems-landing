import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { EVENT, COMMUNITY } from "@/lib/event";
import { SHARE_LINK } from "@/lib/share";

// A 1080x1080 "speaker announcement" card for the team.
//  - GET  ?name=&topic=&photo=  (photo = /public path or https URL)
//  - POST { name, topic, photo } (photo can also be an uploaded data: URL)
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

/** Resolve a photo value to something satori can render, or null. */
async function resolvePhoto(photo: string | null): Promise<string | null> {
  if (!photo) return null;
  if (photo.startsWith("data:image/")) return photo;
  if (photo.startsWith("https://") || photo.startsWith("http://")) return photo;
  if (photo.startsWith("/")) {
    try {
      const clean = photo.replace(/\.\.+/g, "").replace(/^\//, "");
      const bytes = await readFile(join(process.cwd(), "public", clean));
      const ext = clean.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      return `data:image/${ext};base64,${bytes.toString("base64")}`;
    } catch {
      return null;
    }
  }
  return null;
}

async function renderCard(nameRaw: string, topicRaw: string, photoRaw: string | null) {
  const name = (nameRaw || "Speaker name").slice(0, 40);
  const topic = (topicRaw || "").slice(0, 90);
  const photoSrc = await resolvePhoto(photoRaw);

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
          padding: "64px 64px",
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 45%, #0a1622 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -160, left: -120, width: 520, height: 520, borderRadius: "50%", background: "#ff2e88", opacity: 0.32, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: -180, right: -120, width: 520, height: 520, borderRadius: "50%", background: "#06b6d4", opacity: 0.28, filter: "blur(120px)" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={48} height={48} style={{ borderRadius: 11 }} alt="" />
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#e879c9" }}>
              {COMMUNITY.name}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "10px 26px" }}>
            Speaker announcement
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ display: "flex", width: 248, height: 248, borderRadius: "50%", padding: 6, background: "linear-gradient(135deg, #ff2e88, #a855f7 50%, #22d3ee)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#120c22", color: "#8b93a7", fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} width={236} height={236} style={{ objectFit: "cover", borderRadius: "50%" }} alt="" />
              ) : (
                "Photo"
              )}
            </div>
          </div>
          <div style={{ display: "flex", maxWidth: 880, fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1, textAlign: "center", backgroundImage: "linear-gradient(100deg, #ff2e88, #a855f7 45%, #22d3ee)", backgroundClip: "text", color: "transparent" }}>
            {name}
          </div>
          {topic ? (
            <div style={{ display: "flex", maxWidth: 840, fontSize: 32, color: "#e2e8f0", textAlign: "center" }}>
              {topic}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#94a3b8" }}>
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 20, fontSize: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MicrosoftMark />
              <span style={{ color: "#cbd5e1" }}>Powered by Microsoft</span>
            </div>
            <span style={{ fontWeight: 700, color: "#f0abfc" }}>{shareLabel}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return renderCard(sp.get("name") ?? "", sp.get("topic") ?? "", sp.get("photo"));
}

interface AnnounceBody {
  name?: unknown;
  topic?: unknown;
  photo?: unknown;
}

export async function POST(request: Request) {
  let body: AnnounceBody;
  try {
    body = (await request.json()) as AnnounceBody;
  } catch {
    body = {};
  }
  const name = typeof body.name === "string" ? body.name : "";
  const topic = typeof body.topic === "string" ? body.topic : "";
  const photo = typeof body.photo === "string" ? body.photo : null;
  return renderCard(name, topic, photo);
}
