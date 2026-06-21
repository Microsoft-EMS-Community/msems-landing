"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, ShieldCheck, Trophy, X } from "lucide-react";
import { useAuthUser, loginHref } from "@/components/use-auth-user";
import { startGame } from "@/lib/start-game";
import {
  SOC_SHIFT_MS,
  SOC_SPAWN_SLOW_MS,
  SOC_SPAWN_FAST_MS,
  SOC_SURVIVE_BONUS,
  SOC_SEV_POINTS,
} from "@/lib/soc-rules";
import { MEDALS } from "@/lib/medals";

/**
 * "Defender SOC" — a full-screen security-operations triage game. Alerts stream
 * in; the player picks the right response before a breach meter fills up.
 */

type Action = "isolate" | "reset" | "block" | "dismiss";
type Severity = "high" | "med" | "low";

interface Scenario {
  sev: Severity;
  title: string;
  detail: string;
  correct: Action;
}

interface Alert {
  uid: number;
  sev: Severity;
  title: string;
  detail: string;
  correct: Action;
  bornAt: number; // ms into the shift when it spawned
}

interface SocScore {
  name: string;
  best_score: number;
}

const ACTIONS: { key: Action; label: string }[] = [
  { key: "isolate", label: "Isolate device" },
  { key: "reset", label: "Reset creds" },
  { key: "block", label: "Block source" },
  { key: "dismiss", label: "Dismiss" },
];

// Each scenario maps to exactly one correct action; the detail telegraphs it.
// isolate = malware on an endpoint; reset = identity/account compromise;
// block = an external source (sender/IP/URL/domain); dismiss = known-benign.
const SCENARIOS: readonly Scenario[] = [
  // isolate — contain a compromised endpoint
  { sev: "high", title: "Ransomware on a device", detail: "Mass file encryption + shadow-copy deletion on DESKTOP-12", correct: "isolate" },
  { sev: "high", title: "Credential dumper found", detail: "Defender caught Mimikatz running on FINANCE-PC", correct: "isolate" },
  { sev: "med", title: "Malware executing", detail: "Word spawned PowerShell pulling a payload on HR-04", correct: "isolate" },
  { sev: "med", title: "Beacon from one host", detail: "Cobalt Strike process active on LAPTOP-07", correct: "isolate" },
  { sev: "high", title: "C2 beacon to APT infra", detail: "A host is beaconing to known nation-state command infrastructure", correct: "isolate" },

  // reset — revoke an identity/account compromise
  { sev: "high", title: "Impossible-travel sign-in", detail: "jonas@ signed in from Oslo then Lagos 7 min apart", correct: "reset" },
  { sev: "high", title: "Stolen token replay", detail: "A valid session token is being reused from a new ASN", correct: "reset" },
  { sev: "high", title: "Rogue MFA method added", detail: "An unknown device registered an authenticator on effie@", correct: "reset" },
  { sev: "med", title: "Malicious inbox rule", detail: "Account is auto-forwarding all mail to an external address", correct: "reset" },
  { sev: "high", title: "Rogue Global Admin", detail: "An unknown session just granted an account Global Admin", correct: "reset" },

  // block — cut off an external source
  { sev: "high", title: "Phishing wave", detail: "20 users reported the same credential-harvest sender", correct: "block" },
  { sev: "med", title: "Password spray", detail: "600 failed sign-ins from 5.188.x.x in 4 min", correct: "block" },
  { sev: "med", title: "Typosquat clicks", detail: "SmartScreen logging repeat clicks to micros0ft-secure.com", correct: "block" },
  { sev: "low", title: "New C2 domain to block", detail: "Threat-intel feed lists a fresh malware C2 domain for the blocklist", correct: "block" },
  { sev: "high", title: "Trade-secret upload", detail: "A tagged trade-secret file is being uploaded to an external site", correct: "block" },

  // dismiss — known-benign / approved
  { sev: "low", title: "Scheduled EICAR test", detail: "The SecOps scanner running its daily test signature", correct: "dismiss" },
  { sev: "low", title: "Sanctioned admin task", detail: "Approved admin running PsExec during the change window", correct: "dismiss" },
  { sev: "low", title: "Whitelisted vuln scan", detail: "Approved scanner tripping the usual port-scan alerts", correct: "dismiss" },
  { sev: "low", title: "Backup service account", detail: "Expected sign-in from the known backup server", correct: "dismiss" },

  // The people behind it (playful, fictional gags)
  { sev: "high", title: "Jonas reused his password", detail: "Impossible-travel sign-in on jonasb, yet again", correct: "reset" },
  { sev: "high", title: "Effie clicked the phish", detail: "Creds harvested from effie@ after a convincing lure", correct: "reset" },
  { sev: "med", title: "Joël's token got lifted", detail: "Session token stolen on the conference Wi-Fi", correct: "reset" },
  { sev: "high", title: "Jay skipped DMARC", detail: "No p=reject, so spoofed CEO mail is landing in inboxes", correct: "block" },
  { sev: "med", title: "Sebastian's RDP brute-forced", detail: "A single IP is hammering the login on his exposed box", correct: "block" },
  { sev: "med", title: "ToastedTy found a USB", detail: "Mystery USB detonating malware on his laptop", correct: "isolate" },
  { sev: "low", title: "Phil scheduled this", detail: "Sanctioned maintenance during the approved change window", correct: "dismiss" },
  { sev: "low", title: "Sven's backup job", detail: "Known backup service account doing its nightly run", correct: "dismiss" },

  // Intune & Entra / Conditional Access
  { sev: "high", title: "Entra risky user: high", detail: "Atypical travel + anonymous IP flagged on m.olsen@", correct: "reset" },
  { sev: "high", title: "PRT token theft", detail: "Primary Refresh Token lifted from an Entra-joined laptop", correct: "reset" },
  { sev: "med", title: "Intune device rooted", detail: "A managed laptop reports rooted + malware indicators", correct: "isolate" },
  { sev: "med", title: "Tenant password spray", detail: "Legacy-auth spray hitting Exchange Online from one IP", correct: "block" },
  { sev: "low", title: "Report-only CA policy", detail: "A report-only Conditional Access rule logged a would-block", correct: "dismiss" },
  { sev: "low", title: "Autopilot enrollment", detail: "New device enrolling through the approved Autopilot profile", correct: "dismiss" },
  { sev: "low", title: "Compliance re-sync", detail: "Device flicked non-compliant mid-sync, already compliant again", correct: "dismiss" },

  // Defender for Cloud Apps & Purview DLP (aligned with Microsoft Learn)
  { sev: "high", title: "Cloud Apps: TOR IP", detail: "MDCA flagged a user signing in from an anonymous TOR proxy", correct: "reset" },
  { sev: "med", title: "Cloud Apps: inbox rule", detail: "MDCA found a hidden mail-forwarding rule on a mailbox", correct: "reset" },
  { sev: "low", title: "Impossible travel (known)", detail: "MDCA flag, but it's a frequent traveller on the exclusion list", correct: "dismiss" },
  { sev: "low", title: "Anon IP = your red team", detail: "MDCA anonymous-IP alert traced to the sanctioned pentest", correct: "dismiss" },
  { sev: "high", title: "Purview DLP: PII leak", detail: "5,000 customer PII records being emailed to a personal Gmail", correct: "block" },
  { sev: "med", title: "DLP: card data pasted", detail: "Credit-card numbers pasted into an external web form", correct: "block" },
  { sev: "low", title: "DLP false positive", detail: "Pattern matched a card number but it's an internal order ID", correct: "dismiss" },
];

const SHIFT_MS = SOC_SHIFT_MS;
const CAP = 6; // max concurrent alerts
const SURVIVE_BONUS = SOC_SURVIVE_BONUS;

// Module-scope wrappers keep the impure calls out of component render scope.
function now(): number {
  return performance.now();
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sevBase(sev: Severity): number {
  return SOC_SEV_POINTS[sev];
}
function sevPenalty(sev: Severity): number {
  return sev === "high" ? 16 : sev === "med" ? 10 : 6;
}
function sevTtl(sev: Severity): number {
  return sev === "high" ? 9000 : sev === "med" ? 12_000 : 15_000;
}
function spawnInterval(elapsed: number): number {
  const t = Math.min(elapsed / SHIFT_MS, 1);
  return SOC_SPAWN_SLOW_MS - (SOC_SPAWN_SLOW_MS - SOC_SPAWN_FAST_MS) * t;
}

const SEV_DOT: Record<Severity, string> = {
  high: "bg-red-500",
  med: "bg-amber-400",
  low: "bg-slate-400",
};

export function SocGame({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuthUser();
  const [phase, setPhase] = useState<"intro" | "playing" | "over">("intro");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [breach, setBreach] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [result, setResult] = useState<"survived" | "breached" | null>(null);
  const [board, setBoard] = useState<SocScore[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [improved, setImproved] = useState(true);
  const [rank, setRank] = useState(0);

  const game = useRef({ alerts: [] as Alert[], breach: 0, score: 0, streak: 0 });
  const startRef = useRef(0);
  const nextSpawnRef = useRef(0);
  const uidRef = useRef(0);
  const savedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/soc", { cache: "no-store" });
      const data: { scores?: SocScore[] } = await res.json();
      setBoard(Array.isArray(data.scores) ? data.scores : []);
    } catch {
      // best-effort
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sync = useCallback(() => {
    const g = game.current;
    setAlerts([...g.alerts]);
    setBreach(g.breach);
    setScore(g.score);
    setStreak(g.streak);
  }, []);

  // Game loop.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const g = game.current;
      const t = now() - startRef.current;
      setElapsed(t);

      // Expire overdue alerts -> breach.
      const kept: Alert[] = [];
      for (const a of g.alerts) {
        if (t - a.bornAt > sevTtl(a.sev)) {
          g.breach = Math.min(100, g.breach + sevPenalty(a.sev));
          g.streak = 0;
        } else {
          kept.push(a);
        }
      }
      g.alerts = kept;

      // Spawn.
      if (t >= nextSpawnRef.current && g.alerts.length < CAP) {
        const s = pick(SCENARIOS);
        uidRef.current += 1;
        g.alerts = [...g.alerts, { uid: uidRef.current, bornAt: t, ...s }];
        nextSpawnRef.current = t + spawnInterval(t);
      }

      sync();

      if (g.breach >= 100) {
        setResult("breached");
        setPhase("over");
      } else if (t >= SHIFT_MS) {
        g.score += SURVIVE_BONUS;
        setScore(g.score);
        setResult("survived");
        setPhase("over");
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, sync]);

  // Submit the final score once the shift ends.
  useEffect(() => {
    if (phase !== "over" || savedRef.current) return;
    savedRef.current = true;
    const finalScore = game.current.score;
    void (async () => {
      try {
        const res = await fetch("/api/soc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: finalScore, token: tokenRef.current }),
        });
        if (res.ok) {
          const data: { improved?: boolean; rank?: number } = await res.json();
          setImproved(data.improved !== false);
          setRank(typeof data.rank === "number" ? data.rank : 0);
          setSubmitted(true);
          await loadBoard();
        }
      } catch {
        // best-effort
      }
    })();
  }, [phase, loadBoard]);

  async function play() {
    if (!user) return;
    tokenRef.current = await startGame("soc");
    game.current = { alerts: [], breach: 0, score: 0, streak: 0 };
    startRef.current = now();
    nextSpawnRef.current = 500;
    uidRef.current = 0;
    savedRef.current = false;
    setAlerts([]);
    setBreach(0);
    setScore(0);
    setStreak(0);
    setElapsed(0);
    setFeedback(null);
    setResult(null);
    setSubmitted(false);
    setImproved(true);
    setRank(0);
    setPhase("playing");
  }

  function respond(uid: number, action: Action) {
    const g = game.current;
    const a = g.alerts.find((x) => x.uid === uid);
    if (!a) return;
    if (action === a.correct) {
      const mult = 1 + Math.min(g.streak, 10) * 0.1;
      const gained = Math.round(sevBase(a.sev) * mult);
      g.score += gained;
      g.streak += 1;
      setFeedback({ text: `+${gained} · correct`, ok: true });
    } else {
      const pen = sevPenalty(a.sev);
      g.breach = Math.min(100, g.breach + pen);
      g.streak = 0;
      setFeedback({ text: `Wrong call · breach +${pen}%`, ok: false });
    }
    g.alerts = g.alerts.filter((x) => x.uid !== uid);
    sync();
    if (g.breach >= 100) {
      setResult("breached");
      setPhase("over");
    }
  }

  const shiftLeft = Math.max(0, Math.ceil((SHIFT_MS - elapsed) / 1000));

  const leaderboard = (
    <div className="mt-5 w-full max-w-sm">
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Trophy className="size-3.5 text-brand-pink" />
        Top analysts
      </h3>
      {board.length > 0 ? (
        <ol className="mt-2 space-y-1">
          {board.slice(0, 5).map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-1.5 text-sm"
            >
              <span className="truncate">
                <span className="text-muted-foreground">
                  {i < 3 ? MEDALS[i] : `${i + 1}.`}
                </span>{" "}
                {s.name}
              </span>
              <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
                {s.best_score}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No shifts logged yet, set the first score!
        </p>
      )}
      <a
        href="/leaderboard"
        className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
      >
        See full leaderboard →
      </a>
    </div>
  );

  const screen = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a14] text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <h2 className="flex items-center gap-2 font-bold">
          <ShieldCheck className="size-5 text-brand-teal" />
          Defender SOC
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close game"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>

      {phase === "playing" ? (
        <>
          {/* HUD */}
          <div className="border-b border-white/10 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="font-mono">
                Score <span className="font-bold text-foreground">{score}</span>
              </span>
              <span className="font-mono text-muted-foreground">
                Streak x{streak}
              </span>
              <span className="font-mono text-muted-foreground">
                Shift {shiftLeft}s
              </span>
              <span className="ml-auto flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Breach
                </span>
                <span className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500 transition-[width] duration-200"
                    style={{ width: `${breach}%` }}
                  />
                </span>
                <span className="w-9 text-right font-mono text-xs">{breach}%</span>
              </span>
            </div>
            {feedback && (
              <p
                className={`mt-2 text-sm font-medium ${feedback.ok ? "text-brand-teal" : "text-red-400"}`}
              >
                {feedback.text}
              </p>
            )}
          </div>

          {/* Alert queue */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {alerts.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Queue clear. Stay sharp…
              </p>
            ) : (
              <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {alerts.map((a) => {
                  const age = elapsed - a.bornAt;
                  const left = Math.max(0, 1 - age / sevTtl(a.sev));
                  return (
                    <div
                      key={a.uid}
                      className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-2.5 shrink-0 rounded-full ${SEV_DOT[a.sev]}`} />
                        <span className="text-sm font-semibold">{a.title}</span>
                      </div>
                      <p className="mt-1 flex-1 text-xs text-muted-foreground">
                        {a.detail}
                      </p>
                      <span className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-brand-teal transition-[width] duration-200"
                          style={{ width: `${left * 100}%` }}
                        />
                      </span>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {ACTIONS.map((act) => (
                          <button
                            key={act.key}
                            type="button"
                            onClick={() => respond(a.uid, act.key)}
                            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium transition-colors hover:border-brand-pink/50 hover:bg-white/10"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        // Intro & game-over share a centered panel.
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 text-center">
          {phase === "over" && (
            <div className="mb-5 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5">
              <div className="text-4xl">{result === "survived" ? "🛡️" : "🚨"}</div>
              <p className="mt-1 text-lg font-bold">
                {result === "survived" ? "Shift survived!" : "Tenant breached"}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
                {score} pts
              </p>
              {submitted && rank >= 1 && (
                <p className="mt-1 font-medium text-foreground">
                  {rank === 1
                    ? "Top analyst, you're #1!"
                    : `You're #${rank} on the leaderboard`}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {!submitted
                  ? "Saving your score…"
                  : improved
                    ? `Saved as ${user?.username ?? "you"}.`
                    : "Not your best shift, so your top score stands."}
              </p>
            </div>
          )}

          {phase === "intro" && (
            <>
              <ShieldCheck className="size-12 text-brand-teal" />
              <h3 className="mt-3 text-2xl font-bold">Defender SOC</h3>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Alerts stream into your console. Pick the right response for each
                before its timer runs out. Right calls score (with a streak
                multiplier); wrong calls and ignored alerts raise the breach
                meter. Hit 100% and the tenant falls. Survive the {SHIFT_MS / 1000}
                s shift for a bonus.
              </p>
            </>
          )}

          {user === undefined ? (
            <div className="mt-5 h-11 w-full max-w-xs animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <>
              <div className="mt-5 flex w-full max-w-xs items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
                <span className="truncate">
                  Analyst{" "}
                  <span className="font-semibold text-foreground">
                    {user.username}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="ml-2 inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="size-3.5" />
                  Log out
                </button>
              </div>
              <button
                type="button"
                onClick={play}
                className="mt-3 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl brand-gradient-bg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <ShieldCheck className="size-4" />
                {phase === "over" ? "New shift" : "Start shift"}
              </button>
            </>
          ) : (
            <a
              href={loginHref("#soc")}
              className="mt-5 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Log in with Discord to play
            </a>
          )}

          {leaderboard}
        </div>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(screen, document.body);
}
