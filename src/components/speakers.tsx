import Image from "next/image";
import { SPEAKERS, EVENT } from "@/lib/event";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Speakers() {
  const hasSpeakers = SPEAKERS.length > 0;

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

      {hasSpeakers ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SPEAKERS.map((speaker) => (
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
                <p className="text-sm text-muted-foreground">{speaker.title}</p>
              )}
              {speaker.session && (
                <p className="mt-2 text-balance text-sm text-foreground/90">
                  {speaker.session}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-muted-foreground">
            Want to be up here? The Call for Speakers is open.
          </p>
          {EVENT.cfsOpen && (
            <a
              href="#cfs"
              className="mt-4 inline-block text-sm font-medium text-brand-pink underline underline-offset-4 transition-colors hover:text-brand-purple"
            >
              Submit a session →
            </a>
          )}
        </div>
      )}
    </section>
  );
}
