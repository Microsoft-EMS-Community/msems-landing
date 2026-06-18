"use client";

import { useId, useState, type FormEvent } from "react";
import { Check, Loader2, ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, SIGNUP } from "@/lib/event";
import { burstConfetti } from "@/lib/confetti";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "h-14 w-full sm:flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-base outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-brand-pink/60 focus:ring-2 focus:ring-brand-pink/30 disabled:opacity-60";

const buttonClass =
  "sheen brand-gradient-bg h-14 shrink-0 border-0 px-6 text-base text-white hover:opacity-90";

/**
 * Sign-up capture. Renders one of three modes based on `SIGNUP` config:
 *  - external hosted page (EventX / Mailchimp hosted / MS Forms): a link
 *  - Mailchimp embedded action URL: a native POST form (opens confirmation)
 *  - neither configured: an inline AJAX form against /api/notify (interim)
 */
export function NotifyForm() {
  // 1. External hosted signup/registration page.
  if (SIGNUP.externalUrl) {
    return (
      <Button
        render={
          <a href={SIGNUP.externalUrl} target="_blank" rel="noopener noreferrer" />
        }
        size="lg"
        className={`${buttonClass} group px-8`}
      >
        Get notified
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    );
  }

  // 2. Mailchimp embedded form: native POST so it works cross-origin.
  if (SIGNUP.mailchimpAction) {
    return <MailchimpNotifyForm action={SIGNUP.mailchimpAction} />;
  }

  // 3. Interim inline form.
  return <InlineNotifyForm />;
}

function MailchimpNotifyForm({ action }: { action: string }) {
  const fieldId = useId();
  return (
    <form
      action={action}
      method="post"
      target="_blank"
      className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={fieldId} className="sr-only">
        Email address
      </label>
      <input
        id={fieldId}
        name="EMAIL"
        type="email"
        required
        placeholder="you@company.com"
        autoComplete="email"
        className={inputClass}
      />
      <Button type="submit" size="lg" className={buttonClass}>
        Notify me
      </Button>
    </form>
  );
}

function InlineNotifyForm() {
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { ok: boolean; error?: string } = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
      burstConfetti();
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-teal/30 bg-brand-teal/10 p-5 text-center text-sm">
        <p className="flex items-center justify-center gap-2 font-medium">
          <Check className="size-4 shrink-0 text-brand-teal" />
          You&apos;re on the list!
        </p>
        <p className="mt-1 text-muted-foreground">
          We&apos;ll email you the moment registration opens. Now help us fill
          the room.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a
            href="/share"
            className="sheen inline-flex items-center gap-2 rounded-xl brand-gradient-bg px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Megaphone className="size-4" />
            Spread the word
          </a>
          <a
            href={EVENT.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            or say hi on Discord
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-2 sm:flex-row"
      >
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          disabled={status === "submitting"}
          className={inputClass}
        />
        <Button
          type="submit"
          size="lg"
          disabled={status === "submitting"}
          className={buttonClass}
        >
          {status === "submitting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Notify me"
          )}
        </Button>
      </form>
      {status === "error" ? (
        <p role="alert" className="mt-2 text-center text-sm text-destructive">
          {message}
        </p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          We&apos;ll only use your email to tell you when registration opens.
        </p>
      )}
    </div>
  );
}
