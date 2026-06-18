import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Remote photos are only allowed from trusted hosts. The card routes are
 * reachable unauthenticated via `?photo=`, so without this allowlist an
 * attacker could make the server fetch arbitrary URLs (SSRF) or use it as a
 * fetch proxy. The only legitimate remote source is Sessionize speaker
 * avatars; Discord CDN is allowed for parity with logged-in avatars.
 */
const ALLOWED_REMOTE_HOSTS = ["sessionize.com", "cdn.discordapp.com"];

function isAllowedRemote(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  return ALLOWED_REMOTE_HOSTS.some(
    (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
  );
}

/**
 * Resolve a photo value to something satori can render, or null:
 *  - `data:image/…`  uploaded image, embedded as-is
 *  - `https://…`     only if the host is allowlisted (SSRF guard)
 *  - `/path`         a file under /public (path-traversal stripped)
 */
export async function resolvePhoto(
  photo: string | null,
): Promise<string | null> {
  if (!photo) return null;
  if (photo.startsWith("data:image/")) return photo;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return isAllowedRemote(photo) ? photo : null;
  }
  if (photo.startsWith("/")) {
    try {
      const clean = photo.replace(/\.\.+/g, "").replace(/^\//, "");
      const bytes = await readFile(join(process.cwd(), "public", clean));
      const ext = clean.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      return `data:image/${ext};base64,${bytes.toString("base64")}`;
    } catch {
      return null;
    }
  }
  return null;
}
