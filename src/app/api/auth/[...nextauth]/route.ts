// src/app/api/auth/[...nextauth]/route.ts
import { NextRequest } from "next/server";
import { handlers } from "@/auth";

// Dynamic routing execution prevents the build worker compilation crash
export async function GET(request: NextRequest, props: any) {
  return handlers.GET(request, props);
}

export async function POST(request: NextRequest, props: any) {
  return handlers.POST(request, props);
}