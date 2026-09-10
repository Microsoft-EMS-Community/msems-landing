/**
 * Converts the event photo originals (camera PNGs, iPhone HEICs) into the web
 * assets committed under public/photos:
 *   - full/msems-2026-NNN.jpg   high-quality JPEG, original pixel size (download)
 *   - thumb/msems-2026-NNN.webp small WebP for the /photos grid
 * and regenerates src/lib/photos.json (the manifest the gallery renders from).
 *
 * Usage:  node scripts/build-photos.mjs [--force]
 *
 * IDs are sticky: the manifest records which original each id came from, so a
 * re-run reuses the id an original already has and only hands out fresh numbers
 * to originals it has never seen. That keeps /photos/full/msems-2026-042.jpg
 * pointing at the same picture forever, even when photos are added or a source
 * folder is re-sorted, which matters once people have shared those links.
 *
 * To publish more photos: add the folder to SOURCES (or drop files into one
 * that is already listed) and re-run. Delete a photo by removing its files and
 * its manifest entry; its id is then retired, not recycled.
 */
import sharp from "sharp";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, openSync, readSync, closeSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");

/** Folders of originals, in the order they should first be numbered. */
const SOURCES = [
  "C:/MSEMS Event/PNG",
  "C:/MSEMS Event/keep/converted",
  "C:/MSEMS Event/keep/New folder (2)",
];

const fullDir = path.join(root, "public/photos/full");
const thumbDir = path.join(root, "public/photos/thumb");
const manifestPath = path.join(root, "src/lib/photos.json");

const SUPPORTED = /\.(png|jpe?g|dng|heic|heif|tiff?|webp)$/i;
/**
 * Longest edge of a downloadable JPEG. One phone shot is 12240x16320, which
 * encodes to 10 MB and is unusable for anyone posting or printing it; capped
 * it is 1.9 MB. Nothing else in the set is near this, so it only ever touches
 * the outliers.
 */
const MAX_EDGE = 6000;
/** Grid thumbnails render ~400px wide, so 800px covers 2x displays. */
const THUMB_WIDTH = 800;
/** q88 with no chroma subsampling: visually lossless for photos, ~0.7 MB each. */
const JPEG = { quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" };

/** Files in the source folders that are not images we can publish. */
const ignored = [];

/** Wall-clock time in Copenhagen, the shape EXIF already uses. */
const localTime = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Copenhagen",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hour12: false,
});

/**
 * When a photo was taken, as local "YYYY-MM-DDTHH:MM:SS", so the gallery can
 * run as one timeline of the day instead of three blocks by camera.
 *
 * Phone photos carry EXIF DateTimeOriginal, which is plain ASCII in the header,
 * so a scan beats pulling in an EXIF library for one field. The photographer's
 * PNGs have no EXIF at all, but their file times are the real thing: they span
 * 08:00 to 16:00 with a 6s median gap between frames and a 94min break, which
 * is a day of shooting, not a batch export. HEICs decoded to PNG lose EXIF, so
 * heic-to-png.ps1 copies the shot time onto the file for this fallback.
 */
function takenAt(file) {
  const size = statSync(file).size;
  const fd = openSync(file, "r");
  const buffer = Buffer.alloc(Math.min(256 * 1024, size));
  readSync(fd, buffer, 0, buffer.length, 0);
  closeSync(fd);
  const found = buffer
    .toString("latin1")
    .match(/(19|20)[0-9]{2}:[01][0-9]:[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]/g);
  if (found) {
    const [date, clock] = found.sort()[0].split(" ");
    return `${date.replaceAll(":", "-")}T${clock}`;
  }
  return localTime.format(statSync(file).mtime).replace(" ", "T");
}

async function listOriginals() {
  const found = [];
  for (const dir of SOURCES) {
    if (!existsSync(dir)) {
      console.warn(`Skipping missing source folder: ${dir}`);
      continue;
    }
    const all = await readdir(dir);
    for (const name of all.filter((n) => !SUPPORTED.test(n))) {
      ignored.push(path.basename(dir) + "/" + name);
    }
    const names = all
      .filter((name) => SUPPORTED.test(name))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    for (const name of names) {
      // Stored in the manifest as the identity of an original, so it must stay
      // stable: folder name + filename, not the full machine-specific path.
      found.push({ key: `${path.basename(dir)}/${name}`, file: path.join(dir, name) });
    }
  }
  return found;
}

async function loadExistingIds() {
  if (!existsSync(manifestPath)) return new Map();
  const previous = JSON.parse(await readFile(manifestPath, "utf8"));
  return new Map(previous.filter((p) => p.source).map((p) => [p.source, p.id]));
}

async function main() {
  const originals = await listOriginals();
  if (originals.length === 0) {
    console.error("No images found in any source folder.");
    process.exit(1);
  }

  await mkdir(fullDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });

  const existingIds = await loadExistingIds();
  const taken = new Set(existingIds.values());
  let nextNumber = 1;
  const mintId = () => {
    let id = `msems-2026-${String(nextNumber).padStart(3, "0")}`;
    while (taken.has(id)) {
      nextNumber += 1;
      id = `msems-2026-${String(nextNumber).padStart(3, "0")}`;
    }
    taken.add(id);
    return id;
  };

  const manifest = [];
  let converted = 0;
  let skipped = 0;

  // Sequential: sharp already threads internally, and decoding many 12 MP
  // frames at once would balloon memory for no wall-clock gain.
  for (const { key, file } of originals) {
    const id = existingIds.get(key) ?? mintId();
    const fullPath = path.join(fullDir, `${id}.jpg`);
    const thumbPath = path.join(thumbDir, `${id}.webp`);

    if (!force && existsSync(fullPath) && existsSync(thumbPath)) {
      const meta = await sharp(fullPath).metadata();
      manifest.push({
        id, source: key, taken: takenAt(file),
        width: meta.width, height: meta.height,
      });
      skipped += 1;
      continue;
    }

    // .rotate() bakes in EXIF orientation, which phone photos rely on.
    const input = sharp(file).rotate();

    await input
      .clone()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg(JPEG)
      .toFile(fullPath);
    await input
      .clone()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(thumbPath);

    // Read back rather than trusting the original: MAX_EDGE may have shrunk it.
    const published = await sharp(fullPath).metadata();
    manifest.push({
      id, source: key, taken: takenAt(file),
      width: published.width, height: published.height,
    });
    converted += 1;
    process.stdout.write(`\r${converted + skipped}/${originals.length} ${id}   `);
  }

  // Chronological: the manifest order is the order the gallery renders in.
  // Ties fall back to id so the result is stable run to run.
  manifest.sort(
    (a, b) => a.taken.localeCompare(b.taken) ||
      a.id.localeCompare(b.id, "en", { numeric: true }),
  );
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `\nDone. ${converted} converted, ${skipped} already present, ${manifest.length} in manifest.`,
  );
  if (ignored.length > 0) {
    console.log("Not published (unsupported file type):");
    for (const name of ignored) console.log("  " + name);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
