import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 Keep your existing PDF processing configuration:
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },

  // 🌟 Add this block to allow GitHub profile pictures:
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