import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bike, Hotel, MapPin, Plane, Train } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VenueGallery } from "@/components/venue";
import { EVENT } from "@/lib/event";

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
    body: "The driverless Metro runs around the clock from the airport into Copenhagen, and the S-train reaches Kongens Lyngby, a short ride from the venue. Visiting from abroad? Grab the Rejsebillet app to buy tickets.",
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
    icon: Bike,
    title: "Around the city",
    body: "Take the Metro and train to reach the venue. When you're winding down in town, Copenhagen is flat, compact and famously bike-friendly, with city bikes and e-scooters everywhere and a centre made for walking.",
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
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
            We are arranging discounted rates with hotels near the venue.
            Booking details and codes will be shared here and with registered
            attendees.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground">
                  <Hotel className="size-5 opacity-50" />
                </span>
                <h3 className="mt-4 font-semibold text-muted-foreground">
                  Partner hotel
                </h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Discounted rate coming soon
                </p>
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
