import type { NextConfig } from "next";

// PostHog ingest region, derived from NEXT_PUBLIC_POSTHOG_HOST (e.g.
// "https://us.i.posthog.com" -> "us"). Used to build the reverse-proxy
// rewrite destinations below so events aren't blocked by ad/tracker blockers.
const posthogRegion = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").match(
  /^https:\/\/(us|eu)\.i\.posthog\.com/
)?.[1] ?? "us";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `https://${posthogRegion}-assets.i.posthog.com/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `https://${posthogRegion}-assets.i.posthog.com/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `https://${posthogRegion}.i.posthog.com/:path*`,
      },
    ];
  },
  // Required for PostHog API requests, which rely on trailing slashes (e.g. /e/).
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default 1mb is too small for product photo uploads.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
