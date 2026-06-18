import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Ticket, Shield, HeartHandshake, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: "Policies | Microsoft EMS Community Summit",
  description:
    "Tickets and refunds, privacy, code of conduct and organiser details for the Microsoft EMS Community Summit.",
};

const WEEZTIX_TERMS = "https://weeztix.com/ticket-buyer-terms";

export default function PoliciesPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Policies
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The practical bits: tickets and refunds, your privacy, how we expect
            everyone to behave, and who runs the event.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {/* Tickets & refunds */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Ticket className="size-5 text-brand-pink" />
              <h2 className="text-xl font-bold tracking-tight">
                Tickets &amp; refunds
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Tickets are sold by sky made simple ApS through the ticketing
                platform Weeztix. When you buy a ticket you also agree to the{" "}
                <a
                  href={WEEZTIX_TERMS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-pink underline underline-offset-2 hover:text-brand-purple"
                >
                  Weeztix ticket-buyer terms
                </a>
                .
              </p>
              <p>
                <span className="font-medium text-foreground">Refunds:</span> you
                can request a refund of the ticket price up to{" "}
                <span className="font-medium text-foreground">
                  six weeks before
                </span>{" "}
                the Summit. After that, tickets are non-refundable. The booking
                and transaction fees charged by the ticketing provider are not
                refundable.
              </p>
              <p>
                <span className="font-medium text-foreground">Transfers:</span>{" "}
                tickets are transferable. Email us at {EVENT.contactEmail} to
                change the name on a ticket.
              </p>
              <p>
                <span className="font-medium text-foreground">
                  If the event is cancelled
                </span>{" "}
                or rescheduled to a date you can&apos;t make, you&apos;ll be
                refunded the ticket price.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Shield className="size-5 text-brand-teal" />
              <h2 className="text-xl font-bold tracking-tight">Privacy</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                The data controller is sky made simple ApS (VAT DK43434527). For
                any privacy request, email {EVENT.contactEmail}. We only process
                what we need to run the event and keep it simple:
              </p>
              <ul className="space-y-2 pl-1">
                <li>
                  <span className="font-medium text-foreground">Tickets.</span>{" "}
                  Your order and contact details are processed by Weeztix as the
                  ticketing provider, under their own terms.
                </li>
                <li>
                  <span className="font-medium text-foreground">Guest list.</span>{" "}
                  As the Summit is hosted at Microsoft&apos;s office, we share the
                  attendee list (your name) with Microsoft Denmark for venue
                  access and security.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Community games.
                  </span>{" "}
                  The optional Discord login on our mini-games stores your Discord
                  display name, avatar and score so we can show the leaderboards.
                  Ask us and we&apos;ll delete it.
                </li>
                <li>
                  <span className="font-medium text-foreground">Analytics.</span>{" "}
                  We use privacy-friendly, cookieless analytics. No marketing or
                  advertising cookies, and we don&apos;t sell any data.
                </li>
              </ul>
              <p>
                To run the site and the event we rely on a few trusted
                providers, who process data only to deliver their service:
                Vercel (hosting), Supabase (database for the game leaderboards),
                Cloudflare (content delivery and cookieless analytics), Weeztix
                (ticketing) and Discord (optional game sign-in).
              </p>
              <p>
                You can ask us to access or delete your data at any time, just
                get in touch.
              </p>
            </div>
          </section>

          {/* Code of conduct */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="size-5 text-brand-purple" />
              <h2 className="text-xl font-bold tracking-tight">
                Code of conduct
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                The Summit is open to everyone, and we want it to stay friendly,
                professional and welcoming. By attending you agree to:
              </p>
              <ul className="space-y-2 pl-1">
                <li>Be respectful to other attendees, speakers and staff.</li>
                <li>
                  No harassment, discrimination or disruptive behaviour, in any
                  form.
                </li>
                <li>Follow the venue&apos;s rules and the staff&apos;s guidance.</li>
              </ul>
              <p>
                We can refuse entry to, or remove, anyone who breaches this,
                without a refund. If something&apos;s not right on the day, tell
                a member of the team or email {EVENT.contactEmail}.
              </p>
            </div>
          </section>

          {/* Organiser */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-brand-pink" />
              <h2 className="text-xl font-bold tracking-tight">Organiser</h2>
            </div>
            <div className="mt-4 space-y-1 text-sm leading-relaxed text-muted-foreground">
              <p>
                An independent, community-run event. A legal entity handles
                ticketing, payouts and VAT, and the event is run at cost, not for
                profit.
              </p>
              <p className="pt-2">sky made simple ApS (legal entity)</p>
              <p>VAT ID: DK43434527</p>
              <p>Owner: Jonas Bøgvad</p>
              <p>Contact: {EVENT.contactEmail}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to the Summit
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
