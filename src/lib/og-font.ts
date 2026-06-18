// Fonts for the next/og share cards. Satori needs TTF/OTF (not woff2), and
// Google's css2 endpoint serves TTF to non-browser clients, so we fetch from
// there and cache each (family, weight) for the life of the server instance.
//
// The cards pair Space Grotesk (display/headlines) with Inter (body) for a
// punchier, scroll-stopping look in the LinkedIn feed.

type FontWeight = 400 | 600 | 700;

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal";
}

const SPECS: ReadonlyArray<{
  name: string;
  family: string;
  weight: FontWeight;
}> = [
  { name: "Space Grotesk", family: "Space+Grotesk", weight: 700 },
  { name: "Inter", family: "Inter", weight: 400 },
  { name: "Inter", family: "Inter", weight: 600 },
  { name: "Inter", family: "Inter", weight: 700 },
];

const cache = new Map<string, ArrayBuffer>();

async function load(family: string, weight: FontWeight): Promise<ArrayBuffer> {
  const key = `${family}@${weight}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
    { cache: "no-store" },
  ).then((r) => r.text());
  const url = css.match(
    /src:\s*url\((https:[^)]+)\)\s*format\('(?:opentype|truetype)'\)/,
  )?.[1];
  if (!url) throw new Error(`Font source not found: ${family} ${weight}`);

  const data = await fetch(url).then((r) => r.arrayBuffer());
  cache.set(key, data);
  return data;
}

/**
 * Space Grotesk (headlines) + Inter (body) for the share cards. Returns an
 * empty array if the fonts can't be fetched, so the routes can fall back to
 * the default sans-serif rather than failing to render.
 */
export async function cardFonts(): Promise<OgFont[]> {
  try {
    const datas = await Promise.all(SPECS.map((s) => load(s.family, s.weight)));
    return SPECS.map((s, i) => ({
      name: s.name,
      data: datas[i],
      weight: s.weight,
      style: "normal" as const,
    }));
  } catch {
    return [];
  }
}
