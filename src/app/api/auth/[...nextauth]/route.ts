// src/app/api/auth/[...nextauth]/route.ts
import { NextRequest } from "next/server";

// Force Next.js to treat this entire route as completely dynamic
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  // Dynamically load the auth engine ONLY when a real request hits the live server
  const { handlers } = await import("@/auth");
  return handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  // Dynamically load the auth engine ONLY when a real request hits the live server
  const { handlers } = await import("@/auth");
  return handlers.POST(request, context);
}