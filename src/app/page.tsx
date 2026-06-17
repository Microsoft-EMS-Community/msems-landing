import {
  CalendarDays,
  MapPin,
  Ticket,
  Clock,
  Users,
  Sparkles,
  Mic,
} from "lucide-react";
import { AuroraBackground } from "@/components/aurora-background";
import { Agenda } from "@/components/agenda";
import { Countdown } from "@/components/countdown";
import { NotifyForm } from "@/components/notify-form";
import { PoweredByMicrosoft } from "@/components/powered-by-microsoft";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
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
import { EVENT, COMMUNITY, HIGHLIGHTS, TOPICS, FAQS } from "@/lib/event";
import { getDiscordStats, formatCount } from "@/lib/discord";

const FACTS = [
  { icon: CalendarDays, label: "Date", value: EVENT.dateLabel },
  { icon: Clock, label: "Time", value: EVENT.timeLabel },
  { icon: MapPin, label: "Venue", value: `${EVENT.venue}, ${EVENT.venueArea}` },
  { icon: Ticket, label: "Fee", value: EVENT.feeLabel },
] as const;

export default async function Home() {
  const stats = await getDiscordStats();
  const memberLabel = stats.memberCount
    ? `${formatCount(stats.memberCount)}+`
    : COMMUNITY.members;
  const onlineLabel = stats.onlineCount ? formatCount(stats.onlineCount) : null;

  return (
    <main id="top" className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <AuroraBackground />
        <SiteHeader />

        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="rise-in">
            <Badge
              variant="outline"
              className="mb-6 gap-2 border-white/15 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm"
            >
              <Sparkles className="size-3.5 text-brand-pink" />
              {EVENT.status} · {EVENT.dateLabel}
            </Badge>
          </div>

          <p className="rise-in mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink">
            {EVENT.name}
          </p>

          <h1 className="rise-in mx-auto max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            The Microsoft EMS Community,{" "}
            <span className="brand-gradient-text">in real life.</span>
          </h1>

          <p className="rise-in mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            A full day of community-led sessions across Intune, Entra ID and
            Microsoft Defender, hosted at {EVENT.venue}, {EVENT.venueArea}. Open
            to everyone.
          </p>

          {/* Date / location chips */}
          <div className="rise-in mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <CalendarDays className="size-4 text-brand-teal" />
              {EVENT.dateLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <MapPin className="size-4 text-brand-pink" />
              {EVENT.venue}, {EVENT.venueArea}
            </span>
          </div>

          {/* Countdown */}
          <div className="rise-in mx-auto mt-10 max-w-xl">
            <Countdown targetISO={EVENT.startsAtISO} />
          </div>

          {/* Quick email capture */}
          <div className="rise-in mx-auto mt-10 max-w-md">
            <NotifyForm />
            <p className="mt-3 text-sm text-muted-foreground">
              Leave your email and be first in line when registration opens, or{" "}
              <a
                href={EVENT.discordInvite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-brand-pink"
              >
                join the Discord
              </a>
              .
            </p>
          </div>

          {/* Live community proof */}
          <div className="rise-in mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>Seats are limited</span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-2">
              <Users className="size-4" />
              {memberLabel} community members
            </span>
            {onlineLabel && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                  </span>
                  {onlineLabel} online now
                </span>
              </>
            )}
          </div>

          <div className="rise-in mt-8 flex justify-center">
            <PoweredByMicrosoft variant="pill" />
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            One day. The whole community.{" "}
            <span className="brand-gradient-text">In one room.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            We&apos;re taking the community offline for a full day of sessions,
            debate and good company. It&apos;s a not-for-profit, community-run
            event, open to everyone who cares about the Microsoft Enterprise
            Mobility + Security stack. You don&apos;t need to be on the Discord
            to join us.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <PoweredByMicrosoft variant="bar" />
          </div>
        </div>
      </section>

      {/* ---------- Highlights ---------- */}
      <section id="highlights" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {HIGHLIGHTS.map((item) => (
            <Card
              key={item.title}
              className="group relative overflow-hidden border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
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

        {/* Topics */}
        <div className="mt-12 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Topics on the table
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {TOPICS.map((topic) => (
              <Badge
                key={topic.label}
                variant="secondary"
                className="border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-normal"
              >
                {topic.label}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Agenda ---------- */}
      <Agenda />

      {/* ---------- Call for Speakers ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Card className="relative overflow-hidden border-white/10 bg-white/[0.03]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-purple/20 blur-[100px]" />
          <CardContent className="relative flex flex-col items-start gap-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl brand-gradient-bg">
                <Mic className="size-6 text-white" />
              </span>
              <div>
                <h3 className="text-2xl font-bold">
                  Call for Speakers, opening soon
                </h3>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Got something to share with the community? The agenda is being
                  finalised and the Call for Speakers opens shortly. Watch this
                  page and the Discord to submit your session.
                </p>
              </div>
            </div>
            <Button
              render={
                <a
                  href={EVENT.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
              variant="outline"
              className="shrink-0 border-white/15 bg-white/5 hover:bg-white/10"
            >
              Follow on Discord
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
              <h2 className="text-3xl font-bold tracking-tight">
                {COMMUNITY.name}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {COMMUNITY.tagline} We discuss, debate, ask questions and help
                each other build a great community around Microsoft Security,
                from Intune and Entra ID to Microsoft Defender XDR. The event is
                one day a year we get to do it in person.
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
                { value: memberLabel, label: "Members", live: false },
                {
                  value: onlineLabel ?? "Active",
                  label: "Online now",
                  live: Boolean(onlineLabel),
                },
                { value: COMMUNITY.founded, label: "Established", live: false },
                { value: "100%", label: "Community-run", live: false },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
                >
                  <div className="brand-gradient-text text-3xl font-bold">
                    {stat.value}
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

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
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
      </section>

      {/* ---------- Final CTA with notify form ---------- */}
      <section
        id="notify"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center sm:px-10">
          <div className="aurora-blob absolute -left-10 top-0 h-56 w-56 rounded-full bg-brand-pink/25 blur-[90px]" />
          <div
            className="aurora-blob absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-brand-teal/25 blur-[90px]"
            style={{ animationDelay: "-6s" }}
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Save the date, {EVENT.dateLabel}
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {EVENT.feeNote} Seats are limited, so leave your email and be first
            in line when registration opens.
          </p>
          <div className="relative mx-auto mt-8 max-w-md">
            <NotifyForm />
          </div>
          <p className="relative mt-4 text-sm text-muted-foreground">
            Prefer Discord?{" "}
            <a
              href={EVENT.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-brand-pink"
            >
              Join the server
            </a>{" "}
            and hit Interested on the event. Or{" "}
            <a
              href="/share"
              className="text-foreground underline underline-offset-4 hover:text-brand-pink"
            >
              help spread the word
            </a>
            .
          </p>
        </div>
      </section>

      <SiteFooter memberLabel={memberLabel} />
    </main>
  );
}
