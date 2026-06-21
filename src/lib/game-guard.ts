import { verifyToken, tokenAuthEnabled, type GameName } from "@/lib/game-token";
import { consumeNonce } from "@/lib/game-nonce";

/**
 * The single check a game's submit route makes: a valid, unused session token.
 * Returns the verified seed (for deterministic replay in later phases). When no
 * signing secret is set it stays permissive, so local/dev still works and a
 * deploy without the secret changes nothing until you opt in.
 */
export interface GuardResult {
  ok: boolean;
  seed: number;
}

export async function guardSubmission(
  token: unknown,
  game: GameName,
): Promise<GuardResult> {
  if (!tokenAuthEnabled()) return { ok: true, seed: 0 };

  const verified = verifyToken(token, game, Date.now());
  if (!verified) return { ok: false, seed: 0 };

  const fresh = await consumeNonce(verified.nonce);
  if (!fresh) return { ok: false, seed: 0 };

  return { ok: true, seed: verified.seed };
}
