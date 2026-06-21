import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// A 400x400 square, full-bleed logo for social profile pictures (LinkedIn Page,
// X, etc.) so a circular logo doesn't render with white corners in a square
// tile. Brand gradient background with the existing icon centered.
//   GET /logo-square  -> PNG
export const dynamic = "force-dynamic";

export async function GET() {
  const logoBytes = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logoBytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff2e88 0%, #a855f7 50%, #22d3ee 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={340} height={340} alt="" />
      </div>
    ),
    { width: 400, height: 400 },
  );
}
