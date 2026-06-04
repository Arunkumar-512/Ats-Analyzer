import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 THE FIX: Move pdf-parse out of experimental to remove the Vercel compilation warning
  serverExternalPackages: ["pdf-parse"],

  // 🌟 Keeps your existing configuration to allow GitHub profile pictures:
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;