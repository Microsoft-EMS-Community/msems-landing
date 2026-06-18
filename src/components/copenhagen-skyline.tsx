// A faint, layered Copenhagen skyline that drifts in the hero background.
// Three silhouette layers move at different speeds for a parallax-depth feel.
// Pure CSS/SVG (no assets), decorative, and still for reduced-motion users.

// Stylised skyline: flat blocks, gabled rooftops and a couple of spires.
const PATH =
  "M0,200 L0,150 L70,150 L70,120 L130,120 L130,150 L175,150 L195,100 L215,78 L235,100 L235,150 L300,150 L300,128 L355,128 L355,150 L380,150 L398,70 L405,40 L412,70 L412,150 L450,150 L450,112 L520,112 L520,150 L575,150 L595,96 L620,72 L645,96 L645,150 L700,150 L700,132 L745,132 L745,150 L775,150 L792,66 L800,28 L808,66 L808,150 L860,150 L860,118 L930,118 L930,150 L985,150 L1005,98 L1028,78 L1051,98 L1051,150 L1110,150 L1110,128 L1170,128 L1170,150 L1200,150 L1200,200 Z";

const LAYERS = [
  { height: 150, fill: "#7c3aed", opacity: 0.22, duration: "150s" },
  { height: 210, fill: "#a855f7", opacity: 0.3, duration: "104s" },
  { height: 270, fill: "#22d3ee", opacity: 0.38, duration: "72s" },
];

function Tile({ fill, opacity }: { fill: string; opacity: number }) {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className="h-full w-1/2 shrink-0"
    >
      <path d={PATH} fill={fill} fillOpacity={opacity} />
    </svg>
  );
}

export function CopenhagenSkyline() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[300px] overflow-hidden [mask-image:linear-gradient(to_top,black,black_55%,transparent)]"
    >
      {LAYERS.map((layer) => (
        <div
          key={layer.fill}
          className="absolute inset-x-0 bottom-0 overflow-hidden"
          style={{ height: layer.height }}
        >
          <div
            className="skyline-row flex h-full w-[200%]"
            style={{ animationDuration: layer.duration }}
          >
            <Tile fill={layer.fill} opacity={layer.opacity} />
            <Tile fill={layer.fill} opacity={layer.opacity} />
          </div>
        </div>
      ))}
    </div>
  );
}
