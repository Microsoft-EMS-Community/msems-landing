import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. 'unsafe-inline' is required for Next.js's inline
// bootstrap/hydration scripts and React inline styles (no nonce middleware).
// 'unsafe-eval' is only added in dev (React Refresh needs it); production
// stays strict. cloudflareinsights is allowed for Cloudflare Web Analytics.
// *.weeztix.com is allowed for the embedded ticket shop (/tickets).
const weeztix = "https://*.weeztix.com";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  `frame-src 'self' ${weeztix}`,
  `img-src 'self' data: blob: https://cdn.discordapp.com https://sessionize.com ${weeztix}`,
  `font-src 'self' data: ${weeztix}`,
  `style-src 'self' 'unsafe-inline' ${weeztix}`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://static.cloudflareinsights.com ${weeztix}`,
  `connect-src 'self' https://cloudflareinsights.com ${weeztix}`,
  "form-action 'self' https://*.list-manage.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "sessionize.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
