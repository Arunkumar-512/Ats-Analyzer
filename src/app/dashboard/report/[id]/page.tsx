// src/app/dashboard/report/[id]/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardViewClientWrapper from "./DashboardViewClientWrapper";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoricalReportPage({ params }: ReportPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const { id } = await params;

  // 1. Fetch the record from Prisma
  const resumeRecord = await prisma.resume.findUnique({
    where: { id: id },
  });

  // 2. Multi-tenant ownership guard check
  if (!resumeRecord || resumeRecord.userId !== session.user.id) {
    notFound();
  }

  // 3. 🌟 THE SAFE FIX: Wrap the JSON parsing step in a try-catch block
  let parsedAnalysisData;
  try {
    parsedAnalysisData = JSON.parse(resumeRecord.rawAnalysisJson);
  } catch (error) {
    console.error("Malformed or old database JSON entry caught:", error);
    
    // Fallback object structure to prevent crashing your dashboard visual layouts
    parsedAnalysisData = {
      matchScore: resumeRecord.matchScore || 0,
      summary: "This historical log entry contains legacy text structure data and needs to be re-analyzed on the homepage platform.",
      strengths: ["Legacy data profile entry"],
      keywordGaps: [{ keyword: "Please re-run analysis", importance: "Medium" }],
      actionItems: ["Run a fresh parsing pipeline sequence for this file template to generate complete metrics."]
    };
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto w-full mb-2">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-emerald-400 transition-colors"
        >
          ← Return to Dashboard Workspace
        </Link>
      </div>

      <DashboardViewClientWrapper initialData={parsedAnalysisData} />
    </main>
  );
}