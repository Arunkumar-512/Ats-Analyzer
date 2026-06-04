// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter"; // 🔌 Temporarily disconnect
// import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Build a bare-minimum instance without database dependencies
const config = NextAuth({
  // adapter: PrismaAdapter(prisma as any), // 🔌 Temporarily disconnected
  ...authConfig,
  secret: process.env.AUTH_SECRET,
});

if (!config || !config.handlers) {
  console.error("❌ CRITICAL: NextAuth completely failed to build handlers.");
}

export const handlers = config.handlers;
export const auth = config.auth;
export const signIn = config.signIn;
export const signOut = config.signOut;