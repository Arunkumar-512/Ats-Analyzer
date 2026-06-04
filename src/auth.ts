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

const config = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  ...authConfig,
  secret: process.env.AUTH_SECRET,
});

export const handlers = config.handlers;
export const auth = config.auth;
export const signIn = config.signIn;
export const signOut = config.signOut;