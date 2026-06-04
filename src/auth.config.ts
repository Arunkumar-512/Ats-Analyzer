// src/auth.config.ts
import GitHub from "next-auth/providers/github";

export const authConfig = {
  session: {
    strategy: "jwt" as const, // 🌟 THE FIX: 'as const' locks this down as a literal type instead of a loose string
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user && user.id) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};