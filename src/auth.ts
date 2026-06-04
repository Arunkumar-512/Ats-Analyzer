// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const authOptions = {
  secret: process.env.AUTH_SECRET || "1234567890abcdef1234567890abcdef",
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "MOCK_GITHUB_CLIENT_ID",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "MOCK_GITHUB_CLIENT_SECRET",
    }),
  ],
};

let lazyAuth: any;
function getAuthInstance() {
  if (!lazyAuth) {
    lazyAuth = NextAuth(authOptions);
  }
  return lazyAuth;
}

export const handlers = {
  GET: (req: any, ctx: any) => getAuthInstance().handlers.GET(req, ctx),
  POST: (req: any, ctx: any) => getAuthInstance().handlers.POST(req, ctx)
};

export const auth = (...args: any[]) => getAuthInstance().auth(...args);
export const signIn = (...args: any[]) => getAuthInstance().signIn(...args);
export const signOut = (...args: any[]) => getAuthInstance().signOut(...args);