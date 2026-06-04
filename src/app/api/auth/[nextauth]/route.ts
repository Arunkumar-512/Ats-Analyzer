// src/app/api/auth/[nextauth]/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// 🌟 THE ULTIMATE BYPASS: Manually route requests to prevent module destructure loops
async function handleAuth(req: NextRequest) {
  const { handlers } = await import("@/auth");
  
  // Directly forward the HTTP method execution frame
  if (req.method === "POST") {
    return handlers.POST(req);
  }
  return handlers.GET(req);
}

export { handleAuth as GET, handleAuth as POST };