import Image from "next/image";
import { GameLauncher } from "@/components/memory-game";
import { COMMUNITY, EVENT } from "@/lib/event";

interface SiteFooterProps {
  /** Live member label, falls back to the static community value. */
  memberLabel?: string;
}

export function SiteFooter({ memberLabel }: SiteFooterProps) {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Microsoft EMS Community logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <p className="text-sm font-semibold">{COMMUNITY.name}</p>
              <p className="text-xs text-muted-foreground">
                {memberLabel ?? COMMUNITY.members} members · since{" "}
                {COMMUNITY.founded}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:justify-end">
            <a
              href={EVENT.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-brand-pink"
            >
              Discord
            </a>
            <a
              href={EVENT.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={`mailto:${EVENT.contactEmail}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {EVENT.contactEmail}
            </a>
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          This is an independent, community-run event. The Microsoft EMS
          Community is not directly affiliated with, endorsed by, or sponsored
          by Microsoft. Microsoft and product names are trademarks of the
          Microsoft group of companies.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {EVENT.dateLabel.split(", ").pop()} {COMMUNITY.name}.
          </p>
          <GameLauncher />
        </div>
      </div>
    </footer>
  );
}
