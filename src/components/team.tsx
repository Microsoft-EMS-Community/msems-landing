import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TEAM, type TeamMember, type TeamRole } from "@/lib/event";

// Inlined LinkedIn glyph (lucide dropped brand logos in recent versions).
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          width={44}
          height={44}
          className={`size-11 shrink-0 rounded-full object-cover ${
            member.eventTeam ? "ring-2 ring-brand-pink/60" : "ring-1 ring-white/10"
          }`}
        />
      ) : (
        <span
          aria-hidden
          className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold ${
            member.eventTeam
              ? "brand-gradient-bg text-white"
              : "border border-white/10 bg-white/5 brand-gradient-text"
          }`}
        >
          {initials(member.name)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`font-medium ${member.name.length > 18 ? "text-sm" : "text-base"}`}
          >
            {member.name}
          </span>
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
          {member.eventTeam && (
            <Badge
              variant="secondary"
              className="border border-brand-pink/30 bg-brand-pink/10 text-[10px] font-medium text-brand-pink"
            >
              Event team
            </Badge>
          )}
        </div>
        <div className="truncate text-sm text-muted-foreground">
          @{member.handle}
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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The people behind it
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          The Microsoft EMS Community is run by volunteers.
        </p>
      </div>

      {GROUPS.map((group) => {
        const members = TEAM.filter((member) => member.role === group.role);
        if (!members.length) return null;
        return (
          <div key={group.role} className="mt-10">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">
              {group.label}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member.handle} member={member} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
