import Image from "next/image";
import Link from "next/link";
import { NotifyNavButton } from "@/components/notify-nav-button";
import { MobileNav } from "@/components/mobile-nav";
import { GamesLauncher } from "@/components/games-provider";
import { NAV_LINKS } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Microsoft EMS Community logo"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-sm font-semibold">MS EMS Community</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <GamesLauncher
            label={null}
            className="game-pulse hidden size-9 items-center justify-center rounded-lg brand-gradient-bg text-white transition-transform hover:scale-105 md:inline-flex"
          />

          <div className="hidden md:block">
            <NotifyNavButton />
          </div>

          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
