import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BadgePercent, Bike, Car, Footprints, MapPin, Plane, Route, Star, Train } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VenueGallery } from "@/components/venue";
import { HotelCarousel } from "@/components/hotel-carousel";
import { EVENT, HOTELS } from "@/lib/event";

export const metadata: Metadata = {
  title: "Venue & travel | Microsoft EMS Community Summit",
  description:
    "Where the Microsoft EMS Community Summit is hosted, how to get there, and where to stay in Copenhagen.",
};

interface TravelTip {
  icon: typeof Plane;
  title: string;
  body: string;
  links?: ReadonlyArray<{ href: string; label: string }>;
}

const TRAVEL: readonly TravelTip[] = [
  {
    icon: Plane,
    title: "Fly in",
    body: "Copenhagen Airport (CPH) is well connected across Europe and beyond, and sits just south of the city.",
  },
  {
    icon: Train,
    title: "Metro & train",
    body: "The driverless Metro runs around the clock from the airport into Copenhagen, and the S-train reaches Kongens Lyngby, a short ride from the venue. Visiting from abroad? The Rejsebillet app is the easiest way to buy tickets, just pay by card.",
    links: [
      {
        href: "https://apps.apple.com/app/rejsebillet/id1664432486",
        label: "App Store",
      },
      {
        href: "https://play.google.com/store/apps/details?id=dk.rejsekort.rejsebillet",
        label: "Google Play",
      },
    ],
  },
  {
    icon: Car,
    title: "Taxis & Uber",
    body: "Prefer door to door? Taxis are everywhere, and Uber is back in Copenhagen. Both are handy late at night or straight from the airport.",
  },
  {
    icon: Bike,
    title: "Around the city",
    body: "When you're winding down in town, Copenhagen is flat, compact and famously bike-friendly, with city bikes and e-scooters everywhere and a center made for walking.",
  },
];

export default function VenuePage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Hosted in Copenhagen
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            The Summit is hosted at {EVENT.venue}, {EVENT.venueArea}, one of the
            most walkable and bike-friendly cities around. Come for the
            sessions, stay for the harbour, the food and Tivoli.
          </p>
        </div>

        <div className="mt-10">
          <VenueGallery />
        </div>

        {/* Address */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl brand-gradient-bg">
              <MapPin className="size-5 text-white" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                The venue
              </p>
              <p className="font-semibold">
                {EVENT.venue}, {EVENT.venueAddress}
              </p>
            </div>
          </div>
          <a
            href={EVENT.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10"
          >
            <MapPin className="size-4 text-brand-pink" />
            Open in Maps
          </a>
        </div>

        {/* Getting there */}
        <div className="mt-16">
          <h2 className="text-balance text-2xl font-bold tracking-tight">
            Getting there
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRAVEL.map(({ icon: Icon, title, body, links }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl brand-gradient-bg">
                  <Icon className="size-5 text-white" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
                {links && links.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-brand-pink underline underline-offset-4 transition-colors hover:text-brand-purple"
                      >
                        {l.label} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Where to stay */}
        <div className="mt-16">
          <h2 className="text-balance text-2xl font-bold tracking-tight">
            Where to stay
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            A few hotels we&apos;d recommend, all an easy trip to the venue.
          </p>
          <div className="mt-4 flex max-w-2xl items-start gap-3 rounded-2xl border border-brand-pink/25 bg-brand-pink/5 p-4 text-sm">
            <BadgePercent className="size-5 shrink-0 text-brand-pink" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                Discount codes:
              </span>{" "}
              we&apos;re aiming to save you around 10% at some of these hotels
              and will post any codes here. Book whenever suits you, no need to
              wait.
            </p>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOTELS.map((hotel) => (
              <div
                key={hotel.name}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <HotelCarousel
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  photos={[
                    { src: hotel.photo, alt: `${hotel.name} exterior` },
                    { src: hotel.roomPhoto, alt: `${hotel.name} room` },
                  ]}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      {hotel.badge && (
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {hotel.badge}
                        </span>
                      )}
                      {hotel.discountLabel && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-brand-pink/25 bg-brand-pink/10 px-2 py-0.5 text-xs font-medium text-brand-pink">
                          <BadgePercent className="size-3.5" />
                          {hotel.discountLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                    {hotel.area}
                  </p>
                  {hotel.note && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-brand-teal">
                      <Star className="size-3.5 shrink-0" />
                      {hotel.note}
                    </p>
                  )}
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Train className="size-4 shrink-0 opacity-60" />
                    {hotel.travel}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <Footprints className="size-4 shrink-0 opacity-60" />
                    {hotel.social}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-foreground">
                      from &euro;{hotel.pricePerNight}
                    </span>{" "}
                    <span className="text-muted-foreground">/ night</span>
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                    >
                      Book
                    </a>
                    <a
                      href={hotel.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Route className="size-4" />
                      Route
                    </a>
                    <a
                      href={hotel.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MapPin className="size-4" />
                      Location
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to the Summit
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
