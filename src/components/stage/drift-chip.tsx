import { formatDrift, type Minutes } from "@/lib/run-of-show";

/** Traffic-light tone for a schedule delta (positive = behind). */
export function driftTone(delta: Minutes): string {
  if (delta > 5) return "border-red-400/40 bg-red-400/10 text-red-300";
  if (delta > 0) return "border-amber-400/40 bg-amber-400/10 text-amber-300";
  if (delta < 0) return "border-sky-400/40 bg-sky-400/10 text-sky-300";
  return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
}

export function DriftChip({
  delta,
  size = "sm",
}: {
  readonly delta: Minutes;
  readonly size?: "sm" | "lg";
}) {
  const sizing =
    size === "lg"
      ? "px-4 py-1.5 text-sm font-semibold"
      : "px-2 py-0.5 text-xs font-medium";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border ${sizing} ${driftTone(delta)}`}
    >
      {formatDrift(delta)}
    </span>
  );
}
