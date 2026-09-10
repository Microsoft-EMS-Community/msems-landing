/**
 * Event photos published for attendees to download.
 *
 * The files live in the repo under `public/photos` (full/ = high-quality JPEG
 * for downloading, thumb/ = small WebP for the grid). Both, plus the
 * `photos.json` manifest imported here, are generated from the camera
 * originals by `scripts/build-photos.mjs`.
 */
import manifest from "./photos.json";

export interface Photo {
  /** File stem, shared by the full JPEG and the WebP thumbnail. */
  readonly id: string;
  /** Original this was built from, so re-runs can keep ids stable. */
  readonly source: string;
  /** Local "YYYY-MM-DDTHH:MM:SS" the shot was taken. */
  readonly taken: string;
  /** Published pixel dimensions, used to reserve grid space before load. */
  readonly width: number;
  readonly height: number;
}

/**
 * In capture order across every camera, so the gallery reads as one timeline
 * of the day rather than one block per photographer. Sorted at build time by
 * scripts/build-photos.mjs; ids are unrelated to position and never change.
 */
export const PHOTOS: readonly Photo[] = manifest;

/** Public URL of the downloadable full-size JPEG. */
export function fullSrc(id: string): string {
  return `/photos/full/${id}.jpg`;
}

/** Public URL of the grid thumbnail. */
export function thumbSrc(id: string): string {
  return `/photos/thumb/${id}.webp`;
}

/** Where the photos came from, shown on the gallery page. */
export const PHOTO_CREDIT = {
  /** Folder of the same files in the public repo, for bulk downloads. */
  repoUrl:
    "https://github.com/Microsoft-EMS-Community/msems-landing/tree/main/public/photos/full",
} as const;
