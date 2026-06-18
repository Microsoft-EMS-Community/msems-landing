import Image from "next/image";

function Shot({
  src,
  alt,
  caption,
  className,
  big = false,
}: {
  src: string;
  alt: string;
  caption: string;
  className: string;
  big?: boolean;
}) {
  return (
    <figure
      className={`group relative overflow-hidden border border-white/10 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <figcaption
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 font-medium text-white ${
          big ? "text-sm font-semibold sm:p-4" : "text-xs"
        }`}
      >
        {caption}
      </figcaption>
    </figure>
  );
}

/** The venue + Copenhagen photo collage, shared by the home teaser and /venue. */
export function VenueGallery() {
  return (
    <div className="grid auto-rows-[190px] grid-cols-2 gap-4 lg:grid-cols-4">
      <Shot
        src="/location/microsoft.jpg"
        alt="The Microsoft venue near Copenhagen"
        caption="The venue, near Copenhagen"
        className="col-span-2 row-span-2 rounded-3xl"
        big
      />
      <Shot
        src="/location/nyhavn.webp"
        alt="Nyhavn harbour in Copenhagen"
        caption="Nyhavn"
        className="col-span-2 rounded-2xl"
      />
      <Shot
        src="/location/microsoft-inside.jpg"
        alt="Inside the Microsoft offices"
        caption="Inside the venue"
        className="col-span-1 rounded-2xl"
      />
      <Shot
        src="/location/tivoli.avif"
        alt="Tivoli Gardens in Copenhagen"
        caption="Tivoli Gardens"
        className="col-span-1 rounded-2xl"
      />
    </div>
  );
}

/** Home-page teaser: short blurb, the gallery, and a link to the full page. */
export function Venue() {
  return (
    <section
      id="venue"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Hosted in Copenhagen
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          At Microsoft, near Copenhagen. Come for the sessions, stay for
          the city.
        </p>
      </div>

      <div className="mt-10">
        <VenueGallery />
      </div>

      <div className="mt-8 text-center">
        <a
          href="/venue"
          className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Venue, travel and where to stay →
        </a>
      </div>
    </section>
  );
}
