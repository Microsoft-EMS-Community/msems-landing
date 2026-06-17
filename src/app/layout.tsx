import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/event";
import { PointerGlow } from "@/components/pointer-glow";
import { GamesProvider } from "@/components/games-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = SITE_URL;
const eventTitle = "Microsoft EMS Community Summit 2026";
const eventDescription =
  "A full day of community-led sessions for the Microsoft Enterprise Mobility + Security community. Friday, September 4th 2026 · Microsoft, near Copenhagen.";

export const viewport: Viewport = {
  themeColor: "#0f0a1e",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: eventTitle,
  description: eventDescription,
  keywords: [
    "Microsoft EMS Community",
    "Microsoft EMS Community Summit",
    "Microsoft security community",
    "Intune community",
    "Entra ID community",
    "Microsoft Defender community",
    "Microsoft EMS Discord",
    "Intune Discord",
    "Enterprise Mobility + Security",
    "Intune",
    "Entra ID",
    "Microsoft Defender XDR",
    "Microsoft community event",
    "Copenhagen",
    "Denmark",
  ],
  openGraph: {
    title: eventTitle,
    description: eventDescription,
    type: "website",
    locale: "en",
    images: [{ url: "/share-card", width: 1200, height: 630, alt: eventTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: eventTitle,
    description: eventDescription,
    images: ["/share-card"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="scroll-progress brand-gradient-bg" aria-hidden />
        <PointerGlow />
        <GamesProvider>{children}</GamesProvider>
      </body>
    </html>
  );
}
