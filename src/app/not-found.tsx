import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";

export default function NotFound() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
          <Compass className="size-8 text-brand-pink" />
        </span>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-brand-pink/80">
          404
        </p>
        <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          This page took a wrong turn.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          The link is broken or the page has moved. Let&apos;s get you back to
          the {EVENT.shortName}.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link href="/" />}
            size="lg"
            className="brand-gradient-bg border-0 text-white hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Back home
          </Button>
          <Button
            render={<Link href="/#agenda" />}
            variant="outline"
            size="lg"
            className="border-white/15 bg-white/5 hover:bg-white/10"
          >
            See the agenda
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
