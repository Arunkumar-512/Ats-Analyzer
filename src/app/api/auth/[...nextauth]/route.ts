import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: any) {
  const { handlers } = await import("@/auth");
  return handlers.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  const { handlers } = await import("@/auth");
  return handlers.POST(request, context);
}