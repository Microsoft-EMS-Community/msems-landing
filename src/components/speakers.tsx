import Image from "next/image";
import { Mic } from "lucide-react";
import { SPEAKERS } from "@/lib/event";
import { getSessionizeSpeakers } from "@/lib/sessionize";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function Speakers() {
  // Live from Sessionize when published; otherwise the manual fallback list.
  const live = await getSessionizeSpeakers();
  const speakers = live.length > 0 ? live : SPEAKERS;
  const hasSpeakers = speakers.length > 0;

  return (
    <section
      id="speakers"
      className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Speakers
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {hasSpeakers
            ? "The voices behind this year's sessions."
            : "The lineup is being confirmed now. It lands here as speakers are announced."}
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hasSpeakers
          ? speakers.map((speaker) => (
              <div
                key={speaker.name}
                className="reveal flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
              >
                <span className="brand-gradient-bg shrink-0 rounded-full p-[3px]">
                  {speaker.photo ? (
                    <Image
                      src={speaker.photo}
                      alt={speaker.name}
                      width={96}
                      height={96}
                      className="size-24 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid size-24 place-items-center rounded-full bg-card text-xl font-bold brand-gradient-text"
                    >
                      {initials(speaker.name)}
                    </span>
                  )}
                </span>
                <h3 className="mt-4 font-semibold">{speaker.name}</h3>
                {speaker.title && (
                  <p className="text-sm text-muted-foreground">
                    {speaker.title}
                  </p>
                )}
                {speaker.session && (
                  <p className="mt-2 text-balance text-sm text-foreground/90">
                    {speaker.session}
                  </p>
                )}
              </div>
            ))
          : Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center"
              >
                <span className="grid size-24 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                  <Mic className="size-6 opacity-40" />
                </span>
                <h3 className="mt-4 font-semibold text-muted-foreground">
                  To be announced
                </h3>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Session coming soon
                </p>
              </div>
            ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/speakers"
          className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          See the full speaker lineup →
        </a>
      </div>
    </section>
  );
}
