import {
  CalendarDays,
  MapPin,
  Ticket,
  Clock,
  Users,
  Sparkles,
  Mic,
  Megaphone,
  Languages,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { AuroraBackground } from "@/components/aurora-background";
import { FlyingBird } from "@/components/flying-bird";
import { HeroPhotoBackdrop } from "@/components/hero-photo-backdrop";
import { CountUp } from "@/components/count-up";
import { Agenda } from "@/components/agenda";
import { Speakers } from "@/components/speakers";
import { Venue } from "@/components/venue";
import { Pricing } from "@/components/pricing";
import { SocialEvening } from "@/components/social-evening";
import { Team } from "@/components/team";
import { Countdown } from "@/components/countdown";
import { PoweredByMicrosoft } from "@/components/powered-by-microsoft";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { TicketButton } from "@/components/ticket-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  EVENT,
  COMMUNITY,
  HIGHLIGHTS,
  TOPICS,
  FAQS,
  PRICING,
  allInPrice,
  SITE_URL,
} from "@/lib/event";
import { getDiscordStats, formatCount } from "@/lib/discord";

const FACTS = [
  { icon: CalendarDays, label: "Date", value: EVENT.dateLabel },
  { icon: Clock, label: "Time", value: EVENT.timeLabel },
  { icon: MapPin, label: "Venue", value: `${EVENT.venue}, ${EVENT.venueArea}` },
  {
    icon: Ticket,
    label: "Fee",
    value: `From ${PRICING.currency}${allInPrice(PRICING.tiers[0].price)}`,
  },
] as const;

export default async function Home() {
  const stats = await getDiscordStats();
  const memberLabel = stats.memberCount
    ? `${formatCount(stats.memberCount)}+`
    : COMMUNITY.members;
  const onlineLabel = stats.onlineCount ? formatCount(stats.onlineCount) : null;

  // Schema.org Event structured data for search engines (rich results).
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: EVENT.name,
    startDate: EVENT.startsAtISO,
    endDate: EVENT.endsAtISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: EVENT.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Copenhagen",
        addressCountry: "DK",
      },
    },
    description:
      "A full day of community-led sessions across Intune, Entra ID and Microsoft Defender XDR, plus the CloudHour speaker AMA and an evening social. Open to everyone.",
    image: [`${SITE_URL}/share-card`],
    organizer: {
      "@type": "Organization",
      name: COMMUNITY.name,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: allInPrice(PRICING.tiers[0].price),
      priceCurrency: "EUR",
      availability: "https://schema.org/PreOrder",
      url: SITE_URL,
    },
  };

  return (
    <main id="top" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <SiteHeader />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <HeroPhotoBackdrop />
        <AuroraBackground />
        <FlyingBird />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Left: story */}
            <div className="rise-in text-center lg:text-left">
              <Badge
                variant="outline"
                className="gap-2 border-white/15 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm"
              >
                <Sparkles className="size-3.5 text-brand-pink" />
                {EVENT.name}
              </Badge>

              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                The Microsoft EMS Community,{" "}
                <span className="brand-gradient-text">in real life.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0">
                A full day of community-led sessions across Intune, Entra ID and
                Microsoft Defender XDR, hosted at {EVENT.venue}, {EVENT.venueArea}.
                Open to everyone.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-balance text-base italic text-muted-foreground lg:mx-0">
                Need a break from AI? Meet real people, without the agents.
              </p>

              {/* Date / location chips */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm lg:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <CalendarDays className="size-4 text-brand-teal" />
                  {EVENT.dateLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <MapPin className="size-4 text-brand-pink" />
                  {EVENT.venue}, {EVENT.venueArea}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Ticket className="size-4 text-brand-purple" />
                  Early bird {PRICING.currency}
                  {allInPrice(PRICING.tiers[0].price)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <Languages className="size-4 text-brand-teal" />
                  English-speaking event
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                  <ShieldCheck className="size-4 text-brand-pink" />
                  Sponsor-free
                </span>
              </div>

              {/* Live community proof */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4" />
                  <CountUp value={stats.memberCount ?? 2775} suffix="+" />{" "}
                  community members
                </span>
                {onlineLabel && (
                  <>
                    <span className="hidden sm:inline">·</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                      </span>
                      <CountUp value={stats.onlineCount ?? 0} /> online now
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: action card */}
            <div className="rise-in">
              <div className="relative rounded-3xl border border-white/10 bg-background/55 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
                <Countdown targetISO={EVENT.startsAtISO} />

                <div id="signup-top" className="mt-7 scroll-mt-24 rounded-2xl">
                  <p className="mb-3 text-balance text-base font-semibold text-foreground">
                    Tickets are on sale, seats are limited
                  </p>
                  <TicketButton className="sheen brand-gradient-bg w-full border-0 text-base text-white hover:opacity-90" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    From {PRICING.currency}
                    {allInPrice(PRICING.tiers[0].price)} · or{" "}
                    <a
                      href={EVENT.discordInvite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap text-foreground underline underline-offset-4 hover:text-brand-pink"
                    >
                      join the Discord
                    </a>
                    .
                  </p>
                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand-teal/30 bg-brand-teal/[0.06] p-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3 text-left">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg brand-gradient-bg">
                        <Mic className="size-4 text-white" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          Call for Speakers is open
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Got a talk in you? Submit a session.
                        </p>
                      </div>
                    </div>
                    <a
                      href={EVENT.cfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sheen w-full shrink-0 whitespace-nowrap rounded-lg brand-gradient-bg px-4 py-2 text-center text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
                    >
                      Submit a session
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Fact strip ---------- */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 md:grid-cols-4">
          {FACTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 py-6 md:px-6">
              <Icon className="mt-0.5 size-5 shrink-0 text-brand-pink" />
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 text-sm font-medium">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            One day. The whole community.{" "}
            <span className="brand-gradient-text">In one room.</span>
          </h2>
          <p className="mt-5 text-balance text-lg text-muted-foreground">
            For one day, the whole community comes offline: real-world takes on
            the Microsoft EMS stack from the people who actually run it, what
            works and what doesn&apos;t. It&apos;s not-for-profit, community-run
            and open to everyone, so you don&apos;t need to be on the Discord to
            join. Come for the sessions, leave with new contacts, straight
            answers and a few good stories from the field.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <PoweredByMicrosoft variant="bar" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span className="text-muted-foreground/80">In the room:</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <Image
                src="/mvp-badge.png"
                alt="Microsoft MVP"
                width={40}
                height={40}
                className="rounded-[3px]"
              />
              Microsoft MVPs
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <Image
                src="/mct-badge.png"
                alt="Microsoft Certified Trainer"
                width={40}
                height={40}
              />
              Microsoft Certified Trainers
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Highlights ---------- */}
      <section id="highlights" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <Card
              key={item.title}
              className="reveal group relative overflow-hidden border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
            >
              <div className="absolute inset-x-0 top-0 h-px brand-gradient-bg opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Topics marquee */}
        <div className="mt-12 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Topics on the table
          </p>
          <div className="marquee-mask relative mt-5 overflow-hidden">
            <div className="animate-marquee flex gap-2.5">
              {[...TOPICS, ...TOPICS].map((topic, i) => (
                <Badge
                  key={`${topic.label}-${i}`}
                  variant="secondary"
                  className="shrink-0 border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-normal"
                >
                  {topic.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Agenda ---------- */}
      <Agenda />

      {/* ---------- Speakers ---------- */}
      <Speakers />

      {/* ---------- Venue / Copenhagen ---------- */}
      <Venue />

      {/* ---------- Tickets / Pricing ---------- */}
      <Pricing />

      {/* ---------- Evening social (optional add-on) ---------- */}
      <SocialEvening />

      {/* ---------- Call for Speakers ---------- */}
      <section id="cfs" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden border-white/10 bg-white/[0.03]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-purple/20 blur-[100px]" />
          <CardContent className="relative flex flex-col items-center gap-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl brand-gradient-bg">
                <Mic className="size-6 text-white" />
              </span>
              <div>
                <Badge
                  variant="secondary"
                  className="mb-2 border border-brand-teal/30 bg-brand-teal/10 text-xs font-medium text-brand-teal"
                >
                  Now open
                </Badge>
                <h3 className="text-balance text-2xl font-bold">
                  Call for Speakers is open
                </h3>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Got something to share with the community? Submit your session
                  on Sessionize. Talks, demos and CloudHour topics across the
                  Microsoft EMS stack are all welcome.
                </p>
              </div>
            </div>
            <Button
              render={
                <a
                  href={EVENT.cfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
              className="sheen shrink-0 self-center brand-gradient-bg border-0 text-white hover:opacity-90 sm:self-auto"
            >
              Submit a session
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ---------- Community ---------- */}
      <section
        id="community"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6"
      >
        <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
          <CardContent className="grid gap-10 py-12 sm:px-10 md:grid-cols-2 md:items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 gap-2 border-white/15 bg-white/5"
              >
                <Users className="size-3.5 text-brand-teal" />
                Who we are
              </Badge>
              <h2 className="text-balance text-3xl font-bold tracking-tight">
                {COMMUNITY.name}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {COMMUNITY.tagline} We help each other out on Discord, and the
                Summit is our one day a year to meet in person.
              </p>
              <Button
                render={
                  <a
                    href={EVENT.discordInvite}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="mt-6 brand-gradient-bg border-0 text-white hover:opacity-90"
              >
                Join the community
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  node: <CountUp value={stats.memberCount ?? 2775} suffix="+" />,
                  label: "Members",
                  live: false,
                },
                {
                  node: onlineLabel ? (
                    <CountUp value={stats.onlineCount ?? 0} />
                  ) : (
                    "Active"
                  ),
                  label: "Online now",
                  live: Boolean(onlineLabel),
                },
                {
                  // Abbreviate the month ("August 2022" -> "Aug 2022") so the
                  // long value fits the narrow stat card on mobile.
                  node: COMMUNITY.founded.replace(/^(\S{3})\S*/, "$1"),
                  label: "Established",
                  live: false,
                },
                {
                  node: <CountUp value={100} suffix="%" />,
                  label: "Community-run",
                  live: false,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center sm:p-6"
                >
                  <div className="brand-gradient-text text-2xl font-bold leading-tight break-words sm:text-3xl">
                    {stat.node}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    {stat.live && (
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                      </span>
                    )}
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ---------- Team ---------- */}
      <Team />

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <h2 className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <Accordion className="mt-10">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              value={`item-${i}`}
              className="border-white/10"
            >
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mx-auto max-w-xl text-balance text-center text-sm text-muted-foreground mt-8">
          Still have a question? Email us at{" "}
          <a
            href={`mailto:${EVENT.contactEmail}`}
            className="whitespace-nowrap text-foreground underline underline-offset-4 hover:text-brand-pink"
          >
            {EVENT.contactEmail}
          </a>{" "}
          or{" "}
          <a
            href={EVENT.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-foreground underline underline-offset-4 hover:text-brand-pink"
          >
            find us on Discord
          </a>
          .
        </p>
      </section>

      {/* ---------- Spread the word ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-brand-pink/20 bg-brand-pink/[0.05] px-6 py-12 text-center sm:px-10">
          <span className="grid size-12 place-items-center rounded-2xl brand-gradient-bg">
            <Megaphone className="size-6 text-white" />
          </span>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            This event grows when you share it
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Word of mouth is everything for a community event. Grab a ready-made
            post and a share graphic, it only takes 30 seconds.
          </p>
          <a
            href="/share"
            className="sheen inline-flex items-center gap-2 rounded-xl brand-gradient-bg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Megaphone className="size-4" />
            Spread the word
          </a>
        </div>
      </section>

      {/* ---------- Final CTA with notify form ---------- */}
      <section
        id="notify"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6"
      >
        <div
          id="notify-card"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center sm:px-10"
        >
          <div className="aurora-blob absolute -left-10 top-0 h-56 w-56 rounded-full bg-brand-pink/25 blur-[90px]" />
          <div
            className="aurora-blob absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-brand-teal/25 blur-[90px]"
            style={{ animationDelay: "-6s" }}
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Get your ticket
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {EVENT.feeNote} Seats are limited, so grab yours while they last.
          </p>
          <div className="relative mx-auto mt-8 flex justify-center">
            <TicketButton className="sheen brand-gradient-bg border-0 px-8 text-base text-white hover:opacity-90" />
          </div>
          <p className="relative mt-4 text-sm text-muted-foreground">
            Prefer Discord?{" "}
            <a
              href={EVENT.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap text-foreground underline underline-offset-4 hover:text-brand-pink"
            >
              Join the server
            </a>{" "}
            and hit Interested on the event.
          </p>
        </div>
      </section>

      <SiteFooter memberLabel={memberLabel} />
    </main>
  );
}
