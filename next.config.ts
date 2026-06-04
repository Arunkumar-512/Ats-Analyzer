import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 Enforce external compilation for database binaries and drivers
  serverExternalPackages: ["pdf-parse", "@prisma/client", "@prisma/adapter-pg", "pg"],

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