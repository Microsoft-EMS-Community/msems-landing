/**
 * Live community stats pulled from the Discord invite API.
 * Uses `with_counts=true`, which returns approximate member and presence
 * counts without needing a bot token or the widget to be enabled.
 */

const INVITE_CODE = "9eujqRT3AB"; // aka.ms/M365EMSDiscord -> discord.gg/9eujqRT3AB
const INVITE_API = `https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`;

export interface DiscordStats {
  readonly memberCount: number | null;
  readonly onlineCount: number | null;
}

/**
 * Fetches live counts. Returns nulls on any failure so the UI can fall back
 * to static values instead of breaking the render.
 */
export async function getDiscordStats(): Promise<DiscordStats> {
  try {
    const res = await fetch(INVITE_API, {
      headers: { "User-Agent": "MSEMS-Landing (+https://msems.community)" },
      // Cache for 5 minutes; counts don't need to be real-time.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Discord invite API responded ${res.status}`);
    }

    const data: unknown = await res.json();
    const record = data as Record<string, unknown>;
    const member = record.approximate_member_count;
    const online = record.approximate_presence_count;

    return {
      memberCount: typeof member === "number" ? member : null,
      onlineCount: typeof online === "number" ? online : null,
    };
  } catch {
    return { memberCount: null, onlineCount: null };
  }
}

/** Formats a count with thousands separators, e.g. 2775 -> "2,775". */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}
