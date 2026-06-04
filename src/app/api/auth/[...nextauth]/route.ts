// src/app/api/auth/[...nextauth]/route.ts
import { NextRequest } from "next/server";
import * as authModule from "@/auth";

export async function GET(request: NextRequest, props: any) {
  // Dynamically pull the instantiated handler straight from the module export pool
  const handlers = authModule.handlers;
  if (!handlers || !handlers.GET) {
    console.error("Auth.js initialization race condition caught on GET handler extraction.");
    return new Response("Internal Authentication Initialization Error", { status: 500 });
  }
  return handlers.GET(request, props);
}

export async function POST(request: NextRequest, props: any) {
  // Dynamically pull the instantiated handler straight from the module export pool
  const handlers = authModule.handlers;
  if (!handlers || !handlers.POST) {
    console.error("Auth.js initialization race condition caught on POST handler extraction.");
    return new Response("Internal Authentication Initialization Error", { status: 500 });
  }
  return handlers.POST(request, props);
}