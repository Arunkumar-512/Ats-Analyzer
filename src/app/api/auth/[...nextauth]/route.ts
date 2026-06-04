import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  const authModule = await import("@/auth");
  if (!authModule || !authModule.handlers) {
    return new NextResponse("Server initializing...", { status: 503 });
  }
  return authModule.handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  const authModule = await import("@/auth");
  if (!authModule || !authModule.handlers) {
    return new NextResponse("Server initializing...", { status: 503 });
  }
  return authModule.handlers.POST(request, context);
}