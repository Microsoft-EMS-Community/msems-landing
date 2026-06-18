import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImageDown, Mic } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { EVENT, SPEAKERS, type Speaker } from "@/lib/event";
import { getSessionizeSpeakers } from "@/lib/sessionize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Speakers | Microsoft EMS Community Summit",
  description:
    "The speakers and sessions for the Microsoft EMS Community Summit.",
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Auto-filled announcement card URL for a speaker, from their data. */
function announceUrl(s: Speaker): string {
  const p = new URLSearchParams();
  p.set("name", s.name);
  if (s.session) p.set("topic", s.session);
  if (s.photo) p.set("photo", s.photo);
  return `/announce-card?${p.toString()}`;
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="reveal flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
      <span className="brand-gradient-bg shrink-0 rounded-full p-[3px]">
        {speaker.photo ? (
          <Image
            src={speaker.photo}
            alt={speaker.name}
            width={112}
            height={112}
            className="size-28 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span
            aria-hidden
            className="grid size-28 place-items-center rounded-full bg-card text-2xl font-bold brand-gradient-text"
          >
            {initials(speaker.name)}
          </span>
        )}
      </span>

      <h2 className="mt-4 text-lg font-semibold">{speaker.name}</h2>
      {speaker.title && (
        <p className="text-sm text-muted-foreground">{speaker.title}</p>
      )}
      {speaker.session && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-balance text-sm font-medium text-foreground">
          <Mic className="size-3.5 shrink-0 text-brand-pink" />
          {speaker.session}
        </p>
      )}
      {speaker.bio && (
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {speaker.bio}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs">
        {speaker.linkedin && (
          <a
            href={speaker.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${speaker.name} on LinkedIn`}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-[#0a66c2]"
          >
            <LinkedInIcon className="size-4" />
            LinkedIn
          </a>
        )}
        <a
          href={announceUrl(speaker)}
          download={`announce-${speaker.name.toLowerCase().replace(/\s+/g, "-")}.png`}
          className="inline-flex items-center gap-1.5 text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        >
          <ImageDown className="size-4" />
          Announcement card
        </a>
      </div>
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <span className="grid size-28 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground">
        <Mic className="size-7 opacity-40" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-muted-foreground">
        To be announced
      </h2>
      <p className="mt-1 text-sm text-muted-foreground/70">Session coming soon</p>
    </div>
  );
}

export default async function SpeakersPage() {
  const live = await getSessionizeSpeakers();
  const speakers = live.length > 0 ? live : SPEAKERS;
  const hasSpeakers = speakers.length > 0;

  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <span className="inline-grid size-14 place-items-center rounded-2xl brand-gradient-bg">
            <Mic className="size-7 text-white" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Speakers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {hasSpeakers
              ? "The voices behind this year's sessions, and what they're bringing to the day."
              : "Expect 7 to 12 community speakers across the day. The lineup is being confirmed now and lands here, complete with sessions, as it firms up."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hasSpeakers
            ? speakers.map((s) => <SpeakerCard key={s.name} speaker={s} />)
            : Array.from({ length: 6 }, (_, i) => <PlaceholderCard key={i} />)}
        </div>

        {!hasSpeakers && EVENT.cfsOpen && (
          <div className="mt-10 text-center">
            <Button
              render={
                <a
                  href={EVENT.cfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              size="lg"
              className="brand-gradient-bg border-0 text-white hover:opacity-90"
            >
              <Mic className="size-4" />
              Submit a session
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
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
