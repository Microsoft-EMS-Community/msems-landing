"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Speaker } from "@/lib/event";

/**
 * Speaker card download. If the speaker is in Sessionize they can pick their
 * name for a finished card (name + session + photo); otherwise the generic
 * "Your photo" template is offered to customise in Canva.
 */
export function SpeakerCardPicker({ speakers = [] }: { speakers?: Speaker[] }) {
  const [idx, setIdx] = useState(-1);
  const speaker = idx >= 0 ? speakers[idx] : undefined;

  let url = "/speaker-card";
  if (speaker) {
    const p = new URLSearchParams();
    p.set("name", speaker.name);
    if (speaker.session) p.set("topic", speaker.session);
    if (speaker.photo) p.set("photo", speaker.photo);
    url = `/speaker-card?${p.toString()}`;
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div className="w-full max-w-xs shrink-0 overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Speaker card preview"
          width={1080}
          height={1350}
          className="h-auto w-full"
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        {speakers.length > 0 && (
          <label className="text-sm font-medium">
            Confirmed speaker? Pick your name
            <select
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none focus:border-brand-pink/60"
            >
              <option value={-1}>Generic template</option>
              {speakers.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <Button
          render={<a href={url} download="msems-speaker.png" />}
          size="lg"
          className="brand-gradient-bg border-0 text-white hover:opacity-90"
        >
          <Download className="size-4" />
          Download speaker card
        </Button>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {speaker
            ? "Personalised from Sessionize, ready to post as-is."
            : "Tip: drop your photo into the circle in Canva and add your session. Or pick your name above if you're confirmed."}
        </p>
      </div>
    </div>
  );
}
