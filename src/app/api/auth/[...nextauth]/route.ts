// src/app/api/auth/[...nextauth]/route.ts
import { NextRequest } from "next/server";

// 🌟 THE FIX: Force this route to be purely dynamic so the build workers skip static collection
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  // 💡 Dynamically import handlers only when a live user hits the endpoint at runtime
  const { handlers } = await import("@/auth");
  return handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  // 💡 Dynamically import handlers only when a live user hits the endpoint at runtime
  const { handlers } = await import("@/auth");
  return handlers.POST(request, context);
}