import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  // Pages publiques prérendues et mises en cache ; seules les parties liées à la session arrivent en streaming.
  cacheComponents: true,
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/avatars/**" },
    ],
  },
  experimental: {
    // Les images de couverture (5 Mo max) transitent par une server action.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
