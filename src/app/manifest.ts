import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Microsoft EMS Community Summit",
    short_name: "EMS Summit",
    description:
      "A full day of community-led sessions for the Microsoft Enterprise Mobility + Security community. Friday, September 4th 2026, near Copenhagen.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0a1e",
    theme_color: "#0f0a1e",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
