// src/app/api/auth/[...nextauth]/route.ts
import { NextRequest } from "next/server";

// 🌟 THE FIX: Force dynamic execution so Next.js skips evaluation during static build generation
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  // Dynamically import the auth configuration file only when an actual HTTP request lands
  const { handlers } = await import("@/auth");
  return handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  // Dynamically import the auth configuration file only when an actual HTTP request lands
  const { handlers } = await import("@/auth");
  return handlers.POST(request, context);
}