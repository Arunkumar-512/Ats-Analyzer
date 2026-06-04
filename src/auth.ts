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

// 🌟 THE FIX: Map explicit fallbacks so TypeScript never encounters an 'undefined' return track
const lazyAdapter = () => {
  const adapter = PrismaAdapter(prisma as any);
  return {
    ...adapter,
    createUser: (user: any) => adapter.createUser!(user),
    getUser: (id: string) => adapter.getUser!(id),
    getUserByEmail: (email: string) => adapter.getUserByEmail!(email),
    getUserByAccount: (provider_id: any) => adapter.getUserByAccount!(provider_id),
    updateUser: (user: any) => adapter.updateUser!(user),
    linkAccount: (account: any) => adapter.linkAccount!(account),
    unlinkAccount: (account: any) => adapter.unlinkAccount!(account),
    getSessionAndUser: (sessionToken: string) => adapter.getSessionAndUser!(sessionToken),
    createSession: (session: any) => adapter.createSession!(session),
    updateSession: (session: any) => adapter.updateSession!(session),
    deleteSession: (sessionToken: string) => adapter.deleteSession!(sessionToken),
    // 💡 Force explicit fallbacks to bypass the verification type strictness:
    createVerificationToken: (verificationToken: any) => 
      adapter.createVerificationToken ? adapter.createVerificationToken(verificationToken) : Promise.resolve(null),
    useVerificationToken: (params: any) => 
      adapter.useVerificationToken ? adapter.useVerificationToken(params) : Promise.resolve(null),
  };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: lazyAdapter() as any, // 💡 Typecast to 'any' here ensures Auth.js accepts the runtime layout shape perfectly
  session: {
    strategy: "jwt", 
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
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