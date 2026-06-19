import Image from "next/image";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { TicketButton } from "@/components/ticket-button";
import { MobileNav } from "@/components/mobile-nav";
import { GamesLauncher, GamepadGradient } from "@/components/games-provider";
import { NAV_LINKS } from "@/lib/nav";
import { PRICING, allInPrice } from "@/lib/event";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      {/* Announcement strip — part of the sticky header, so it follows. */}
      <Link
        href="/#tickets"
        className="flex items-center justify-center gap-2 brand-gradient-bg px-4 py-1.5 text-center text-xs font-medium text-white transition-opacity hover:opacity-90 sm:text-sm"
      >
        <Ticket className="size-3.5 shrink-0 sm:size-4" />
        Early bird tickets, only {PRICING.currency}
        {allInPrice(PRICING.tiers[0].price)}
        <span className="hidden opacity-80 sm:inline">· On sale now</span>
      </Link>

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
          <nav className="hidden items-center gap-6 lg:flex">
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
            icon={<GamepadGradient className="game-wiggle size-5" />}
            className="hidden size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 lg:inline-flex"
          />

          <div className="hidden lg:block">
            <TicketButton
              label="Get tickets"
              arrow={false}
              size="default"
              className="sheen brand-gradient-bg border-0 text-white hover:opacity-90"
            />
          </div>

          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
