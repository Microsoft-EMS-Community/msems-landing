"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Speaker } from "@/lib/event";

const inputClass =
  "h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none focus:border-brand-pink/60";

/**
 * Team tool: pick a speaker from Sessionize (or type one), tweak the session,
 * optionally upload a photo, and download a ready-to-post announcement card.
 * The card is rendered server-side (so it matches the other graphics) and
 * previewed live.
 */
export function AnnounceBuilder({ speakers = [] }: { speakers?: Speaker[] }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [photo, setPhoto] = useState<string | null>(null); // data or https URL
  const [photoName, setPhotoName] = useState("");

  function onPickSpeaker(e: React.ChangeEvent<HTMLSelectElement>) {
    const speaker = speakers[Number(e.target.value)];
    if (!speaker) return;
    setName(speaker.name);
    setTopic(speaker.session ?? "");
    setPhoto(speaker.photo ?? null);
    setPhotoName(speaker.photo ? `${speaker.name} (Sessionize)` : "");
  }
  const [preview, setPreview] = useState<string | null>(null); // object URL
  const [busy, setBusy] = useState(false);
  const objUrl = useRef<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : null);
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  // Re-render the card shortly after any change (debounced).
  useEffect(() => {
    const id = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch("/announce-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, topic, photo }),
        });
        if (res.ok) {
          const blob = await res.blob();
          if (objUrl.current) URL.revokeObjectURL(objUrl.current);
          objUrl.current = URL.createObjectURL(blob);
          setPreview(objUrl.current);
        }
      } catch {
        // best-effort preview
      } finally {
        setBusy(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [name, topic, photo]);

  useEffect(() => {
    return () => {
      if (objUrl.current) URL.revokeObjectURL(objUrl.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex w-full flex-col gap-3 lg:max-w-xs">
        {speakers.length > 0 && (
          <label className="text-sm font-medium">
            Pick from Sessionize
            <select
              defaultValue=""
              onChange={onPickSpeaker}
              className={`mt-1.5 ${inputClass}`}
            >
              <option value="" disabled>
                Choose a speaker…
              </option>
              {speakers.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
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

        <span className="text-sm font-medium">Speaker photo</span>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10">
          <ImagePlus className="size-4" />
          {photoName ? "Change photo" : "Upload a photo"}
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
        </label>
        {photoName && (
          <span className="truncate text-xs text-muted-foreground">
            {photoName}
          </span>
        )}

        <Button
          render={
            <a
              href={preview ?? "#"}
              download="msems-speaker-announcement.png"
              aria-disabled={!preview}
            />
          }
          className="brand-gradient-bg border-0 text-white hover:opacity-90"
        >
          <Download className="size-4" />
          Download card
        </Button>
      </div>

      <div className="relative w-full flex-1 overflow-hidden rounded-2xl border border-white/10">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Speaker announcement preview"
            width={1080}
            height={1080}
            className="h-auto w-full"
          />
        ) : (
          <div className="grid aspect-square place-items-center text-sm text-muted-foreground">
            Fill in the details to preview
          </div>
        )}
        {busy && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            Updating…
          </span>
        )}
      </div>
    </div>
  );
}
