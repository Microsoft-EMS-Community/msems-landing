"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { Check, Copy, Link2, LoaderCircle, Plus } from "lucide-react";

const SHORT_PREFIX = "msems.community/go/";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

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
 * Create-a-short-link form. No account needed: creation is gated by a
 * Cloudflare Turnstile check, verified server-side in /api/go.
 */
export function LinkShortener() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (
      !TURNSTILE_SITE_KEY ||
      !widgetRef.current ||
      !window.turnstile ||
      widgetId.current !== null
    ) {
      return;
    }
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (t) => setToken(t),
      "expired-callback": () => setToken(""),
    });
  }, []);

  // The script may already be loaded (e.g. client-side navigation back here).
  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  // Tokens are single use: after any submit, ask Turnstile for a fresh one.
  function resetChallenge() {
    setToken("");
    if (widgetId.current !== null) {
      window.turnstile?.reset(widgetId.current);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.state === "saving") return;
    setStatus({ state: "saving" });
    setCopied(false);
    try {
      const res = await fetch("/api/go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          slug: slug || undefined,
          turnstileToken: token || undefined,
        }),
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
    } finally {
      resetChallenge();
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

  const awaitingChallenge = Boolean(TURNSTILE_SITE_KEY) && !token;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onLoad={renderWidget}
          strategy="lazyOnload"
        />
      )}

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

      {/* Cloudflare Turnstile bot check; renders compactly, often invisibly. */}
      <div ref={widgetRef} className="flex justify-center empty:hidden" />

      {status.state === "error" && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.state === "saving" || awaitingChallenge}
        className="brand-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-xl border-0 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status.state === "saving" ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Link2 className="size-4" />
        )}
        {status.state === "saving"
          ? "Creating..."
          : awaitingChallenge
            ? "Checking you're human..."
            : "Create short link"}
      </button>
    </form>
  );
}
