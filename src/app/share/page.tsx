import type { Metadata } from "next";
import Link from "next/link";
import { Download, ArrowLeft, Hash, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT } from "@/lib/event";
import { SHARE_POSTS, HASHTAGS, SHARE_LINK, buildPostText } from "@/lib/share";

export const metadata: Metadata = {
  title: "Spread the word | Microsoft EMS Community Summit",
  description:
    "Help us spread the word about the Microsoft EMS Community Summit. Grab a ready-to-post message and a share graphic.",
};

const GUIDANCE: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "Tag the community",
    body: "Mention the Microsoft EMS Community and tag people who'd love this. Word of mouth is everything for a community event.",
  },
  {
    title: "Add the graphic",
    body: "Posts with an image get far more reach. Download the share card below and attach it to your post.",
  },
  {
    title: "Keep the link",
    body: "Leave the link in so people can save the date and get notified when registration opens.",
  },
];

export default function SharePage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6">
        <Badge
          variant="outline"
          className="mb-6 gap-2 border-white/15 bg-white/5 px-4 py-1.5 text-sm"
        >
          <Megaphone className="size-3.5 text-brand-pink" />
          Spread the word
        </Badge>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Help us fill the room.{" "}
          <span className="brand-gradient-text">It takes 30 seconds.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          This is a community event, so it grows when you share it. Grab the
          graphic, copy a ready-made post, and let your network know.
        </p>
      </section>

      {/* Share graphic */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <div className="w-full overflow-hidden rounded-2xl border border-white/10">
              {/* The share card is generated at /share-card (1200x630 PNG). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/share-card"
                alt="MS EMS Community event share graphic"
                width={1200}
                height={630}
                className="h-auto w-full"
              />
            </div>
            <Button
              render={<a href="/share-card" download="msems-event.png" />}
              size="lg"
              className="brand-gradient-bg border-0 text-white hover:opacity-90"
            >
              <Download className="size-4" />
              Download share graphic
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Guidance */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {GUIDANCE.map((tip) => (
            <div
              key={tip.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h3 className="font-semibold">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {tip.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ready-made posts */}
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-12 sm:px-6">
        <h2 className="text-balance text-2xl font-bold tracking-tight">
          Pick a post and copy it
        </h2>
        <p className="mt-2 text-muted-foreground">
          Tweak the wording to sound like you, then post away.
        </p>

        <div className="mt-8 space-y-5">
          {SHARE_POSTS.map((post) => {
            const fullText = buildPostText(post);
            return (
              <Card
                key={post.id}
                className="border-white/10 bg-white/[0.03]"
              >
                <CardContent className="py-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold">{post.platform}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {post.note}
                      </span>
                    </div>
                    <CopyButton text={fullText} />
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 font-sans text-sm leading-relaxed text-foreground/90">
                    {fullText}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Hashtags + link */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2">
            <Hash className="size-4 text-brand-teal" />
            <h3 className="font-semibold">Suggested hashtags</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border border-white/10 bg-white/5 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Link to share:</span>
            <a
              href={SHARE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-foreground underline underline-offset-4 hover:text-brand-pink"
            >
              {SHARE_LINK}
            </a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to {EVENT.shortName}
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
