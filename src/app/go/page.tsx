import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  MousePointerClick,
  ShieldCheck,
  Cookie,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LinkShortener } from "@/components/link-shortener";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DAILY_LINK_LIMIT, getPublicLinks } from "@/lib/short-links";

export const metadata: Metadata = {
  title: "Link shortener | Microsoft EMS Community Summit",
  description:
    "Create short msems.community/go links. Community run: no cookies, no trackers, no visitor logging.",
};

const PROMISES: ReadonlyArray<{
  icon: typeof Cookie;
  title: string;
  body: string;
}> = [
  {
    icon: Cookie,
    title: "No cookies, no trackers",
    body: "We never log who clicked: no cookies, no IPs, no profiles. Each link only keeps a click count and a last-used date.",
  },
  {
    icon: Users,
    title: "By the community",
    body: "Creating a link takes a Discord login, the same one as the games. All links are listed publicly on this page, with your username next to them.",
  },
  {
    icon: ShieldCheck,
    title: "Kept clean",
    body: `Every new link is posted to the team channel, and abusive links are removed. Links never clicked in their first 90 days are cleaned up. Up to ${DAILY_LINK_LIMIT} links per person per day.`,
  },
];

interface GoPageProps {
  searchParams: Promise<{ missing?: string }>;
}

export default async function GoPage({ searchParams }: GoPageProps) {
  const [{ missing }, links] = await Promise.all([
    searchParams,
    getPublicLinks(),
  ]);
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 pb-12 pt-16 text-center sm:px-6">
        <Badge
          variant="outline"
          className="mb-6 gap-2 border-white/15 bg-white/5 px-4 py-1.5 text-sm"
        >
          <Link2 className="size-3.5 text-brand-teal" />
          Community links
        </Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Short links, <span className="brand-gradient-text">zero tracking.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Turn long URLs into clean{" "}
          <span className="whitespace-nowrap font-medium text-foreground">
            msems.community/go/
          </span>{" "}
          links. No cookie walls, no ad pages, no click logging. Just the
          redirect.
        </p>
      </section>

      <section className="mx-auto max-w-xl px-4 pb-12 sm:px-6">
        {missing && (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-200">
            That short link doesn&apos;t exist (or was removed). You can create
            a new one below.
          </p>
        )}
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="py-6">
            <LinkShortener />
          </CardContent>
        </Card>
      </section>

      {links.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-2 px-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Community links{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({links.length})
                </span>
              </h2>
              <span className="text-xs text-muted-foreground">
                most used first
              </span>
            </div>
            <ul className="mt-3 max-h-96 divide-y divide-white/5 overflow-y-auto px-1">
              {links.map((link) => (
                <li
                  key={link.slug}
                  className="flex items-center gap-x-3 py-1.5"
                >
                  <a
                    href={`/go/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm font-medium underline-offset-4 transition-colors hover:text-brand-pink hover:underline"
                  >
                    go/{link.slug}
                  </a>
                  <span
                    title={link.url}
                    className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
                  >
                    {link.url.replace(/^https?:\/\//, "")}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {link.discord_name}
                  </span>
                  <span className="inline-flex w-12 shrink-0 items-center justify-end gap-1 text-xs tabular-nums text-muted-foreground">
                    <MousePointerClick className="size-3 text-brand-teal" />
                    {link.clicks}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {PROMISES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <item.icon className="size-4 text-brand-teal" />
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to the Summit
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
