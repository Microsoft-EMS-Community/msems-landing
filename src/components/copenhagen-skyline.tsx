// A faint, layered Copenhagen skyline that drifts in the hero background.
// Three distinct depth planes — sparse spires far back, blocky towers in the
// middle, tidy gabled rooftops up front — each drifting at its own speed.
// Pure CSS/SVG (no assets), decorative, and still for reduced-motion users.

// Distant landmarks: slim spires rising out of a low, gappy baseline.
const FAR =
  "M0,180 L0,165 L90,165 L150,165 L156,95 L160,55 L164,95 L170,165 L280,165 L300,165 L300,80 L345,80 L345,165 L430,165 L452,165 L457,105 L461,50 L465,105 L470,165 L600,165 L600,180 Z";

// Middle band: medium blocks and towers with stepped tops.
const MID =
  "M0,180 L0,150 L70,150 L70,120 L120,120 L120,150 L180,150 L200,150 L200,100 L210,90 L250,90 L260,100 L260,150 L320,150 L320,128 L380,128 L380,150 L430,150 L450,150 L450,110 L520,110 L520,150 L600,150 L600,180 Z";

// Foreground: a rhythm of gabled townhouses and flat roofs.
const NEAR =
  "M0,180 L0,150 L40,150 L60,120 L80,150 L120,150 L120,132 L168,132 L168,150 L208,150 L228,118 L248,150 L288,150 L288,130 L336,130 L336,150 L376,150 L396,116 L416,150 L456,150 L456,132 L516,132 L516,150 L556,150 L576,120 L596,150 L600,150 L600,180 Z";

interface Layer {
  path: string;
  fill: string;
  opacity: number;
  /** Layer band height, px. */
  height: number;
  /** Tile width, px — also the drift distance per loop. */
  tile: number;
  duration: string;
}

const LAYERS: Layer[] = [
  { path: FAR, fill: "#7c3aed", opacity: 0.18, height: 150, tile: 600, duration: "170s" },
  { path: MID, fill: "#a855f7", opacity: 0.24, height: 178, tile: 540, duration: "115s" },
  { path: NEAR, fill: "#22d3ee", opacity: 0.32, height: 205, tile: 470, duration: "80s" },
];

function tileImage(path: string, fill: string, opacity: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 180' preserveAspectRatio='none'><path d='${path}' fill='${fill}' fill-opacity='${opacity}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function CopenhagenSkyline() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[240px] overflow-hidden [mask-image:linear-gradient(to_top,black,black_50%,transparent)]"
    >
      {LAYERS.map((layer) => (
        <div
          key={layer.fill}
          className="skyline-layer absolute inset-x-0 bottom-0"
          style={{
            height: layer.height,
            backgroundImage: tileImage(layer.path, layer.fill, layer.opacity),
            backgroundSize: `${layer.tile}px 100%`,
            animationDuration: layer.duration,
            ["--skyline-shift" as string]: `-${layer.tile}px`,
          }}
        />
      ))}
    </div>
  );
}
