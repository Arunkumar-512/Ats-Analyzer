import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 ADD THIS SPECIFIC BLOCK:
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

export default nextConfig;