import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SIGNUP } from "@/lib/event";

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/#agenda", label: "Agenda" },
  { href: "/#community", label: "Community" },
  { href: "/#faq", label: "FAQ" },
  { href: "/share", label: "Spread the word" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Microsoft EMS Community logo"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="hidden text-sm font-semibold sm:inline">
            MS EMS Community
          </span>
        </a>

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

        <Button
          render={<a href={SIGNUP.externalUrl ?? `/${SIGNUP.anchor}`} />}
          className="brand-gradient-bg border-0 text-white hover:opacity-90"
        >
          Get notified
        </Button>
      </div>
    </header>
  );
}
