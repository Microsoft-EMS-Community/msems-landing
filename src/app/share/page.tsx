import type { Metadata } from "next";
import Link from "next/link";
import { Download, ArrowLeft, Hash, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CopyButton } from "@/components/copy-button";
import { CardBuilder } from "@/components/card-builder";
import { getSessionizeSpeakers } from "@/lib/sessionize";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  SHARE_POSTS,
  HASHTAGS,
  PRIMARY_HASHTAG,
  SHARE_LINK,
  buildPostText,
} from "@/lib/share";

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

export default async function SharePage() {
  const speakers = await getSessionizeSpeakers();
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
            <a
              href="/logo.png"
              download="msems-logo.png"
              className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Need just the logo? Download the PNG
            </a>
          </CardContent>
        </Card>
      </section>

      {/* "I'm attending" card */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight">
            Tell everyone you&apos;re going
          </h2>
          <p className="mt-2 text-muted-foreground">
            Post the &quot;I&apos;m attending, are you?&quot; card to your feed.
            It is a 1080x1350 PNG, ready to share as-is.
          </p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="w-full max-w-xs shrink-0 overflow-hidden rounded-2xl border border-white/10">
              {/* Generated at /attending-card (1080x1350 PNG). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/attending-card"
                alt="I'm attending the Microsoft EMS Community Summit card"
                width={1080}
                height={1350}
                className="h-auto w-full"
              />
            </div>
            <Button
              render={<a href="/attending-card" download="msems-attending.png" />}
              size="lg"
              className="brand-gradient-bg border-0 text-white hover:opacity-90"
            >
              <Download className="size-4" />
              Download card
            </Button>
          </div>
        </div>
      </section>

      {/* Speaker card */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight">
            Speaking at the Summit?
          </h2>
          <p className="mt-2 text-muted-foreground">
            A 1080x1350 PNG. Pick your name from Sessionize, or type it and
            upload a headshot, then download. No Canva needed.
          </p>
          <div className="mt-6">
            <CardBuilder
              route="/speaker-card"
              downloadName="msems-speaker.png"
              speakers={speakers}
            />
          </div>
        </div>
      </section>

      {/* Speaker announcement builder (for the team) */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-brand-pink/20 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Megaphone className="size-4 text-brand-pink" />
            <h2 className="text-2xl font-bold tracking-tight">
              Announce a speaker
            </h2>
            <Badge
              variant="secondary"
              className="border border-white/10 bg-white/5 text-xs font-normal"
            >
              For the team
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Type the speaker and their session to generate a ready-to-post
            reveal card. The website link is baked in.
          </p>
          <div className="mt-6">
            <CardBuilder
              route="/announce-card"
              downloadName="msems-speaker-announcement.png"
              speakers={speakers}
            />
          </div>
        </div>
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
            <span className="text-sm text-muted-foreground">
              (lead with {PRIMARY_HASHTAG})
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {HASHTAGS.map((tag) =>
              tag === PRIMARY_HASHTAG ? (
                <Badge
                  key={tag}
                  className="brand-gradient-bg border-0 font-semibold text-white"
                >
                  {tag}
                </Badge>
              ) : (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="border border-white/10 bg-white/5 font-normal"
                >
                  {tag}
                </Badge>
              ),
            )}
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
            Back to the Summit
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
