"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Link2, LoaderCircle, LogOut, Plus } from "lucide-react";
import { useAuthUser, loginHref } from "@/components/use-auth-user";
import { DiscordIcon } from "@/components/discord-icon";

const SHORT_PREFIX = "msems.community/go/";

interface CreateResponse {
  ok?: boolean;
  error?: string;
  shortUrl?: string;
}

type Status =
  | { readonly state: "idle" }
  | { readonly state: "saving" }
  | { readonly state: "error"; readonly message: string }
  | { readonly state: "done"; readonly shortUrl: string };

/**
 * Create-a-short-link form. Creation requires the same Discord login as the
 * games; the resulting msems.community/go/<slug> link is public.
 */
export function LinkShortener() {
  const { user, logout } = useAuthUser();
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.state === "saving") return;
    setStatus({ state: "saving" });
    setCopied(false);
    try {
      const res = await fetch("/api/go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug: slug || undefined }),
      });
      const data = (await res.json()) as CreateResponse;
      if (!res.ok || !data.ok || !data.shortUrl) {
        setStatus({
          state: "error",
          message: data.error ?? "Something went wrong. Try again.",
        });
        return;
      }
      setStatus({ state: "done", shortUrl: data.shortUrl });
    } catch {
      setStatus({ state: "error", message: "Something went wrong. Try again." });
    }
  }

  async function handleCopy(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setUrl("");
    setSlug("");
    setStatus({ state: "idle" });
    setCopied(false);
  }

  // Loading the session: keep layout stable, no flash of the login button.
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Log in with Discord to create links. Only your username is stored
          with the link, and every link is listed publicly on this page.
        </p>
        <a
          href={loginHref("")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <DiscordIcon className="size-4" />
          Log in with Discord
        </a>
      </div>
    );
  }

  if (status.state === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-sm text-muted-foreground">Your short link is live:</p>
        <a
          href={status.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-lg font-semibold text-foreground underline underline-offset-4 hover:text-brand-pink"
        >
          {status.shortUrl}
        </a>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleCopy(status.shortUrl)}
            className="brand-gradient-bg inline-flex items-center gap-2 rounded-xl border-0 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <Plus className="size-4" />
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Logged in as <span className="font-medium text-foreground">{user.username}</span>
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <LogOut className="size-3" />
          Log out
        </button>
      </div>

      <div>
        <label htmlFor="link-url" className="mb-1.5 block text-sm font-medium">
          Long URL
        </label>
        <input
          id="link-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://learn.microsoft.com/..."
          maxLength={2048}
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand-pink/60"
        />
      </div>

      <div>
        <label htmlFor="link-slug" className="mb-1.5 block text-sm font-medium">
          Short name <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <div className="flex items-center rounded-xl border border-white/15 bg-black/30 transition-colors focus-within:border-brand-pink/60">
          <span className="pl-4 text-sm text-muted-foreground">{SHORT_PREFIX}</span>
          <input
            id="link-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="random"
            maxLength={40}
            pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]"
            title="3-40 characters: lowercase letters, numbers, and hyphens"
            className="w-full bg-transparent py-2.5 pr-4 text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {status.state === "error" && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.state === "saving"}
        className="brand-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status.state === "saving" ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Link2 className="size-4" />
        )}
        {status.state === "saving" ? "Creating..." : "Create short link"}
      </button>
    </form>
  );
}
