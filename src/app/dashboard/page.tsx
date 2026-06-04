// app/dashboard/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WorkspaceListClient from "@/components/WorkspaceListClient";

// 🌟 THE PRODUCTION FIX: Force this route to be evaluated dynamically at runtime.
// This prevents the Next.js static engine from checking auth() during compilation.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    // 1. Server-side session authentication check
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }

    // Force cast to strict string for compilation safety parameters 
    const currentUserId = session.user.id as string;

    // 2. Query only the resumes belonging strictly to this user context
    const userResumes = await prisma.resume.findMany({
        where: { userId: currentUserId },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ">
            <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 min-h-screen text-slate-100">
                <header className="mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight font-mono">
                        YOUR <span className="text-slate-500">WORKSPACE</span>
                    </h1>
                    <p className="text-sm text-white/90 mt-1">
                        Review and optimize your multi-tenant saved resume analysis profiles.
                    </p>
                </header>

                {userResumes.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-white/70">
                        <p className="text-sm text-slate-500 font-mono">No resumes processed in this account workspace yet.</p>
                    </div>
                ) : (
                    /* Stream the fetched database array directly to our interactive UI component */
                    <WorkspaceListClient initialResumes={userResumes} />
                )}
            </main>
        </div>
    );
}