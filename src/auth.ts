// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; 
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; 
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Attaches safely and cleanly instantly
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: "jwt", 
  },
  providers: [
    GitHub({
      clientId: (process.env.GITHUB_CLIENT_ID as string) || "",
      clientSecret: (process.env.GITHUB_CLIENT_SECRET as string) || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});