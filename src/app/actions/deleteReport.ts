"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteReport(reportId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized access token payload." };
    }

    const deleteOp = await prisma.resume.deleteMany({
      where: {
        id: reportId,
        userId: session.user.id,
      },
    });

    if (deleteOp.count === 0) {
      return { success: false, error: "Document record not found or unauthorized." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Database deletion fault executed:", error);
    return { success: false, error: "Internal database server execution error." };
  }
}