// auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; 
import GitHub from "next-auth/providers/github";

// 🛠️ Type definitions interfaces allocation
declare module "next-auth" {
  interface Session {
    user: {
      id: string; 
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", 
  },
  providers: [
    GitHub({
      // 💡 The Permanent Fix: Asserting as string or using fallback strings removes 'string | undefined' error flags
      clientId: (process.env.GITHUB_CLIENT_ID as string) || "",
      clientSecret: (process.env.GITHUB_CLIENT_SECRET as string) || "",
    }),
  ],
  callbacks: {
    // 🔑 Step 1: Secure token allocations
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id as string;
      }
      return token;
    },
    // 🔑 Step 2: Session payload distributions
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});