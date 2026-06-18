"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none focus:border-brand-pink/60";

/**
 * A small builder for the team: type a speaker's name + session (and optionally
 * a photo path/URL) and get a finished announcement card to download.
 */
export function AnnounceBuilder() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [photo, setPhoto] = useState("");

  const params = new URLSearchParams();
  if (name.trim()) params.set("name", name.trim());
  if (topic.trim()) params.set("topic", topic.trim());
  if (photo.trim()) params.set("photo", photo.trim());
  const query = params.toString();
  const url = `/announce-card${query ? `?${query}` : ""}`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex w-full flex-col gap-3 lg:max-w-xs">
        <label className="text-sm font-medium">
          Speaker name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jay Kerai"
            maxLength={40}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
        <label className="text-sm font-medium">
          Session title
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Locking down Intune at scale"
            maxLength={90}
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
        <label className="text-sm font-medium">
          Photo <span className="text-muted-foreground">(optional)</span>
          <input
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="/team/jay-kerai.jpg or an https URL"
            className={`mt-1.5 ${inputClass}`}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Use a team photo path like /team/jay-kerai.jpg, or paste an image
            URL. Leave blank to add the photo in Canva later.
          </span>
        </label>
        <Button
          render={<a href={url} download="msems-speaker-announcement.png" />}
          className="brand-gradient-bg border-0 text-white hover:opacity-90"
        >
          <Download className="size-4" />
          Download card
        </Button>
      </div>

      <div className="w-full flex-1 overflow-hidden rounded-2xl border border-white/10">
        {/* Live preview of the generated card. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Speaker announcement preview"
          width={1080}
          height={1080}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
