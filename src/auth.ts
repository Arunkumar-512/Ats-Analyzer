// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const authInstance = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  ...authConfig,
});

export const handlers = authInstance.handlers;
export const auth = authInstance.auth;
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;