import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase, CalendarDays, MapPin, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyButton } from "@/components/copy-button";
import { EVENT, PRICING, SITE_URL } from "@/lib/event";

export const metadata: Metadata = {
  title: "Convince your boss | Microsoft EMS Community Summit",
  description:
    "A ready-made letter to help you get sign-off to attend the Microsoft EMS Community Summit.",
};

const earlyBird = `${PRICING.currency}${PRICING.tiers[0].price}`;

const LETTER = `Hi [Manager],

I'd like to attend the ${EVENT.name} on ${EVENT.dateLabel}, hosted at ${EVENT.venue}, ${EVENT.venueAddress}.

It's a full day of community-led, vendor-neutral sessions on the Microsoft Enterprise Mobility + Security stack: Intune, Entra ID and Microsoft Defender, plus a live CloudHour round-table and speaker AMA. The talks are practical and run by practitioners, so I'll come back with techniques I can apply to our environment right away.

Why it's worth it:
- Directly relevant to our work with Intune, Entra ID and Microsoft Defender.
- Honest, hands-on sessions from peers, not sales pitches.
- Networking with people solving the same problems we are.
- A not-for-profit community event, so the cost stays low.

Costs:
- Ticket: early bird from ${earlyBird}, covering the full day, lunch and refreshments.
- Travel: flights to Copenhagen, local transport, and a hotel night if needed.

I'll write up the key takeaways and share them with the team afterwards.

Event details: ${SITE_URL}

Thanks for considering it,
[Your name]`;

const FACTS = [
  { icon: CalendarDays, label: EVENT.dateLabel },
  { icon: MapPin, label: `${EVENT.venue}, ${EVENT.venueArea}` },
  { icon: Ticket, label: `Early bird from ${earlyBird}` },
];

export default function ConvincePage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl brand-gradient-bg">
            <Briefcase className="size-7 text-white" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Convince your boss
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Need sign-off to attend? Copy the letter below, fill in the blanks,
            and send it over. It makes the case in 30 seconds.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {FACTS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <Icon className="size-4 text-brand-pink" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">The letter</h2>
            <CopyButton text={LETTER} />
          </div>
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 font-sans text-sm leading-relaxed text-foreground/90">
            {LETTER}
          </pre>
        </div>

        <div className="mt-10 text-center">
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
