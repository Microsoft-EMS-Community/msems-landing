/**
 * Client helper: ask the server for a signed session token at the start of a
 * run. The token is sent back on score submit so the server knows a game was
 * actually started. Returns null if unavailable (the server stays permissive
 * until a signing secret is configured).
 */
export async function startGame(
  game: "memory" | "reaction" | "soc",
): Promise<string | null> {
  try {
    const res = await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game }),
    });
    if (!res.ok) return null;
    const data: { token?: string | null } = await res.json();
    return typeof data.token === "string" ? data.token : null;
  } catch {
    return null;
  }
}
