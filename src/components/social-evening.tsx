import Image from "next/image";
import { PRICING } from "@/lib/event";

const PHOTOS: ReadonlyArray<{ src: string; alt: string }> = [
  { src: "/social/boulebar-1.jpg", alt: "Pétanque courts at Boulebar" },
  { src: "/social/boulebar-2.jpg", alt: "The Boulebar venue" },
  { src: "/social/boulebar-3.avif", alt: "Boules and drinks at Boulebar" },
  { src: "/social/boulebar-4.avif", alt: "An evening at Boulebar" },
];

export function SocialEvening() {
  const { socialAddon, currency } = PRICING;

  return (
    <section
      id="social"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Make a night of it
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            After the sessions, keep it going over pétanque, food and drinks
            with the community. We are planning the evening social at{" "}
            {socialAddon.venue}, a relaxed boules-and-bar spot in the heart of
            Copenhagen.
          </p>
          {!socialAddon.confirmed && (
            <p className="mt-2 text-sm text-muted-foreground">
              Plans are still being finalized, so the venue may change.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-violet-400/40 bg-violet-400/15 px-2.5 py-0.5 text-xs font-medium text-violet-200">
              Optional add-on
            </span>
            <span className="text-sm text-muted-foreground">
              Add it to your ticket for{" "}
              <span className="font-semibold text-foreground">
                +{currency}
                {socialAddon.price}
              </span>
              .
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
