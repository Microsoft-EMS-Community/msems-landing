import type { Metadata } from "next";
import { Camera, Download, FolderDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PhotoGallery } from "@/components/photo-gallery";
import { PHOTOS, PHOTO_CREDIT } from "@/lib/photos";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: "Photos | Microsoft EMS Community Summit",
  description:
    "Photos from the Microsoft EMS Community Summit, free for attendees and speakers to download and share.",
  // Linked from the nav so attendees find it, but kept out of search: these
  // are pictures of people who came, not marketing for the next event.
  robots: { index: false, follow: false },
};

export default function PhotosPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl brand-gradient-bg">
            <Camera className="size-6 text-white" />
          </span>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Photos from the Summit
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            All {PHOTOS.length} shots from {EVENT.dateLabel}, free to download
            and share. Post them, print them, put them on your slides. A credit
            to the {EVENT.name} is always appreciated.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Download className="size-4 text-brand-teal" />
              Click any photo, then Download
            </span>
            <a
              href={PHOTO_CREDIT.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-brand-teal underline underline-offset-4 transition-colors hover:text-brand-pink"
            >
              <FolderDown className="size-4" />
              Grab the whole set from GitHub
            </a>
          </div>
        </div>

        <div className="mt-12">
          <PhotoGallery />
        </div>

      </section>

      <SiteFooter />
    </main>
  );
}
