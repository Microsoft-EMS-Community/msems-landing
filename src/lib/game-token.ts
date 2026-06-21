import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed, single-use, time-bounded game-session tokens. The server issues one
 * when a run starts and verifies it on submit, so a score can't be posted
 * without first starting a game, and a token can't be replayed (see
 * game-nonce.ts). Stateless by design: the token carries its own data + HMAC,
 * so issuing costs no storage — only *used* nonces are persisted. Adding a game
 * = list it here; the guard and routes stay generic.
 */

export type GameName = "memory" | "reaction" | "soc";

export function isGameName(v: unknown): v is GameName {
  return v === "memory" || v === "reaction" || v === "soc";
}

/** Plausible play-time window per game; bounds how long a token stays valid. */
const WINDOW: Record<GameName, { minMs: number; maxMs: number }> = {
  // 6 pairs can't be cleared in under a few seconds.
  memory: { minMs: 3_000, maxMs: 30 * 60_000 },
  // 6 rounds each wait 700-2000ms before the target, so ~4s floor.
  reaction: { minMs: 4_000, maxMs: 15 * 60_000 },
  // a shift runs up to 100s, but can end early on a breach.
  soc: { minMs: 3_000, maxMs: 15 * 60_000 },
};

interface TokenPayload {
  g: GameName; // game
  n: string; // nonce (single-use)
  s: number; // seed (for deterministic replay, used by later phases)
  iat: number; // issued-at, server epoch ms
}

const SECRET = process.env.GAME_SIGNING_SECRET;

/** Token auth is active only once a signing secret is configured. */
export function tokenAuthEnabled(): boolean {
  return Boolean(SECRET);
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

/** Issue a token for a starting run. Returns null when unconfigured (dev). */
export function issueToken(
  game: GameName,
  nowMs: number,
): { token: string; seed: number } | null {
  if (!SECRET) return null;
  const payload: TokenPayload = {
    g: game,
    n: randomBytes(16).toString("base64url"),
    s: randomBytes(4).readUInt32LE(0),
    iat: nowMs,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body, SECRET)}`, seed: payload.s };
}

export interface VerifiedToken {
  game: GameName;
  nonce: string;
  seed: number;
  elapsedMs: number;
}

/** Verify the signature, the game, and the timing window. */
export function verifyToken(
  token: unknown,
  game: GameName,
  nowMs: number,
): VerifiedToken | null {
  if (!SECRET || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = sign(body, SECRET);
  const got = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TokenPayload;
  } catch {
    return null;
  }
  if (payload.g !== game || typeof payload.n !== "string") return null;

  const win = WINDOW[game];
  const elapsed = nowMs - payload.iat;
  if (!Number.isFinite(elapsed) || elapsed < win.minMs || elapsed > win.maxMs) {
    return null;
  }
  return { game, nonce: payload.n, seed: payload.s, elapsedMs: elapsed };
}
