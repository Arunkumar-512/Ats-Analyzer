"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteReport(reportId: string) {
  try {
    // 1. Authenticate tenant context securely
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized access token payload." };
    }

    // 2. Perform conditional deletion matching both record ID and owner ID
    const deleteOp = await prisma.resume.deleteMany({
      where: {
        id: reportId,
        userId: session.user.id, // 🌟 Absolute multi-tenant safety barrier
      },
    });

    if (deleteOp.count === 0) {
      return { success: false, error: "Document record not found or unauthorized." };
    }

    // 3. Purge Server-Side Data Caches for the dashboard view to force structural updates
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Database deletion fault executed:", error);
    return { success: false, error: "Internal database server execution error." };
  }
}