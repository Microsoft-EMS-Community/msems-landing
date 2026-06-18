import Image from "next/image";
import { TEAM, EVENT, type TeamMember, type TeamRole } from "@/lib/event";

// Inlined LinkedIn glyph (lucide dropped brand logos in recent versions).
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127.14 96.36" fill="currentColor" className={className} aria-hidden>
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  );
}

// Inline SVG flags — emoji flags don't render on Windows, so we draw them.
function Flag({ country }: { country: string }) {
  const cls = "inline-block h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/15";
  switch (country) {
    case "Denmark":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={cls} role="img" aria-label="Denmark">
          <rect width="28" height="20" fill="#c8102e" />
          <rect y="8" width="28" height="4" fill="#fff" />
          <rect x="9" width="4" height="20" fill="#fff" />
        </svg>
      );
    case "Netherlands":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={cls} role="img" aria-label="Netherlands">
          <rect width="28" height="20" fill="#21468b" />
          <rect width="28" height="13.34" fill="#fff" />
          <rect width="28" height="6.67" fill="#ae1c28" />
        </svg>
      );
    case "Greece":
      return (
        <svg viewBox="0 0 28 20" preserveAspectRatio="none" className={cls} role="img" aria-label="Greece">
          <rect width="28" height="20" fill="#0d5eaf" />
          <rect y="2.22" width="28" height="2.22" fill="#fff" />
          <rect y="6.67" width="28" height="2.22" fill="#fff" />
          <rect y="11.11" width="28" height="2.22" fill="#fff" />
          <rect y="15.56" width="28" height="2.22" fill="#fff" />
          <rect width="11.11" height="11.11" fill="#0d5eaf" />
          <rect x="4.45" width="2.22" height="11.11" fill="#fff" />
          <rect y="4.45" width="11.11" height="2.22" fill="#fff" />
        </svg>
      );
    case "United Kingdom":
      return (
        <svg viewBox="0 0 60 30" preserveAspectRatio="none" className={cls} role="img" aria-label="United Kingdom">
          <clipPath id="uk-s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="uk-t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#uk-s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#c8102e" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const GROUPS: ReadonlyArray<{ role: TeamRole; label: string }> = [
  { role: "moderator", label: "Moderators" },
  { role: "contributor", label: "Contributors" },
];

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="reveal flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <span className="brand-gradient-bg shrink-0 rounded-full p-[2px]">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-full bg-card text-sm font-bold brand-gradient-text"
          >
            {initials(member.name)}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`font-medium ${member.name.length > 18 ? "text-sm" : "text-base"}`}
          >
            {member.name}
          </span>
          {member.country && <Flag country={member.country} />}
          {member.mvp && (
            <Image
              src="/mvp-badge.png"
              alt="Microsoft MVP"
              title="Microsoft MVP"
              width={16}
              height={16}
              className="rounded-[3px]"
            />
          )}
          {member.mct && (
            <Image
              src="/mct-badge.png"
              alt="Microsoft Certified Trainer"
              title="Microsoft Certified Trainer"
              width={16}
              height={16}
            />
          )}
        </div>
      </div>

      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-[#0a66c2]"
        >
          <LinkedInIcon className="size-4" />
        </a>
      )}
    </div>
  );
}

export function Team() {
  return (
    <section
      id="team"
      className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          The people behind it
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          The Microsoft EMS Community is run by volunteers.
        </p>
      </div>

      {GROUPS.map((group) => {
        const members = TEAM.filter(
          (member) => member.role === group.role,
        ).sort((a, b) => a.name.localeCompare(b.name));
        if (!members.length) return null;
        return (
          <div key={group.role} className="mt-10">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">
              {group.label}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-12 text-center">
        <a
          href={EVENT.discordInvite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
        >
          <DiscordIcon className="size-4 text-[#5865F2]" />
          Find them all on Discord
        </a>
      </div>
    </section>
  );
}
