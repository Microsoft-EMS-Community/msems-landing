"use client";

import { useEffect, useState } from "react";
import { Gamepad2, ShieldCheck, Zap } from "lucide-react";
import { MEDALS } from "@/lib/medals";

interface Score {
  name: string;
  moves: number;
}

interface Reaction {
  name: string;
  best_ms: number;
}

interface Soc {
  name: string;
  best_score: number;
}

function Row({
  label,
  icon,
  entries,
}: {
  label: string;
  icon: React.ReactNode;
  entries: { name: string; value: string }[];
}) {
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        {icon}
        {label}
      </span>
      {entries.slice(0, 3).map((s, i) => (
        <span key={`${s.name}-${i}`} className="whitespace-nowrap">
          {MEDALS[i]} {s.name}{" "}
          <span className="text-muted-foreground/70">({s.value})</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Compact top-3 previews for both games. Each row hides itself until that
 * board has scores, and the whole block disappears when both are empty.
 */
export function LeaderboardPreview() {
  const [memory, setMemory] = useState<Score[]>([]);
  const [reaction, setReaction] = useState<Reaction[]>([]);
  const [soc, setSoc] = useState<Soc[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/score", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { scores?: Score[] }) => {
        if (active) setMemory(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => {});
    fetch("/api/reaction", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { scores?: Reaction[] }) => {
        if (active) setReaction(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => {});
    fetch("/api/soc", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { scores?: Soc[] }) => {
        if (active) setSoc(Array.isArray(d.scores) ? d.scores : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (memory.length === 0 && reaction.length === 0 && soc.length === 0)
    return null;

  return (
    <div className="space-y-1.5">
      <Row
        label="Memory match"
        icon={<Gamepad2 className="size-3.5 text-brand-pink" />}
        entries={memory.map((s) => ({ name: s.name, value: `${s.moves}` }))}
      />
      <Row
        label="Patch the Threat"
        icon={<Zap className="size-3.5 text-brand-pink" />}
        entries={reaction.map((s) => ({
          name: s.name,
          value: `${s.best_ms} ms`,
        }))}
      />
      <Row
        label="Defender SOC"
        icon={<ShieldCheck className="size-3.5 text-brand-pink" />}
        entries={soc.map((s) => ({ name: s.name, value: `${s.best_score} pts` }))}
      />
      <a
        href="/leaderboard"
        className="inline-block whitespace-nowrap text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
      >
        View all →
      </a>
    </div>
  );
}
