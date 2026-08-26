"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Wipes everything this page remembers: recorded times, trimmed durations
 * and the rehearsal clock. Two taps, so a stray click on stage is harmless.
 */
export function ResetButton({ onReset }: { readonly onReset: () => void }) {
  const [arming, setArming] = useState(false);

  if (!arming) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="border-white/15 bg-white/5 hover:bg-white/10"
        onClick={() => setArming(true)}
      >
        <Trash2 className="size-3.5" /> Reset all
      </Button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2 text-xs">
      <span className="text-muted-foreground">Clear times, trims and clock?</span>
      <Button
        size="sm"
        variant="outline"
        className="border-red-400/50 bg-red-400/10 text-red-300 hover:bg-red-400/20"
        onClick={() => {
          onReset();
          setArming(false);
        }}
      >
        Yes, clear
      </Button>
      <Button size="sm" variant="outline" onClick={() => setArming(false)}>
        Keep
      </Button>
    </span>
  );
}
