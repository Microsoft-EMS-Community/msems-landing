/**
 * Decorative animated aurora blobs + grid backdrop for the hero.
 * Purely presentational; hidden from assistive tech.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 grid-backdrop opacity-60" />
      <div className="aurora-blob absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-brand-pink/30 blur-[120px]" />
      <div
        className="aurora-blob absolute -top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-brand-teal/25 blur-[120px]"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="aurora-blob absolute top-40 left-1/3 h-[24rem] w-[24rem] rounded-full bg-brand-purple/30 blur-[120px]"
        style={{ animationDelay: "-8s" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
