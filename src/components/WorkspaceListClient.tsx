"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteReport } from "@/app/actions/deleteReport";

interface ResumeListItem {
  id: string;
  fileName: string | null;
  matchScore: number;
  rawAnalysisJson: string;
  createdAt: Date;
}

interface WorkspaceListClientProps {
  initialResumes: ResumeListItem[];
}

export default function WorkspaceListClient({ initialResumes }: WorkspaceListClientProps) {
  const [resumes, setResumes] = useState(initialResumes);
  const [isPending, startTransition] = useTransition();
  
  // 🌟 State tracking for our interactive modal custom overlay
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const triggerDeletePrompt = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Stop the <Link> container from routing immediately
    setReportToDelete(id); // Open our custom modular panel frame
  };

  const executeConfirmedDelete = () => {
    if (!reportToDelete) return;

    const targetId = reportToDelete;
    setReportToDelete(null); // Close modal instantly

    // Optimistically filter the entry out from the current screen view
    setResumes((prev) => prev.filter((item) => item.id !== targetId));

    startTransition(async () => {
      const result = await deleteReport(targetId);
      if (!result.success) {
        alert(`Deletion failed: ${result.error}`);
        setResumes(initialResumes); // Revert state list if db flags an issue
      }
    });
  };

  return (
    <div className="relative">
      <div className="grid gap-4 md:grid-cols-2">
        {resumes.map((resume) => {
          let parsedData = { summary: "" };
          if (resume.rawAnalysisJson) {
            try {
              const cleanJson = typeof resume.rawAnalysisJson === "string" 
                ? resume.rawAnalysisJson 
                : JSON.stringify(resume.rawAnalysisJson);
              parsedData = JSON.parse(cleanJson);
            } catch (e) {
              // Graceful fallback for older profiles
            }
          }

          const matchScore = resume.matchScore ?? 0;
          const badgeStyles = matchScore >= 80 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : matchScore >= 55
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-rose-500/10 text-rose-400 border-rose-500/20";

          return (
            <Link
              key={resume.id}
              href={`/dashboard/report/${resume.id}`}
              className="block group"
            >
              <div className="border border-slate-900 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 hover:border-slate-500/30 group-hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between min-h-[160px] cursor-pointer shadow-lg shadow-black/20 relative">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-semibold text-white/90 text-sm truncate max-w-[65%] group-hover:text-emerald-400 transition-colors font-mono">
                      📄 {resume.fileName || "Untitled_Document.pdf"}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 z-10">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${badgeStyles}`}>
                        {matchScore}% Match
                      </span>
                      <button
                        onClick={(e) => triggerDeletePrompt(e, resume.id)}
                        disabled={isPending}
                        className="p-1.5 rounded-md border border-slate-800 bg-slate-950/40 hover:bg-rose-950/40 hover:border-rose-500/30 text-rose-300 hover:text-rose-400 transition-all text-xs cursor-pointer"
                        title="Delete Profile Log Entry"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/60 line-clamp-2 mb-4 font-sans leading-relaxed">
                    {parsedData?.summary || "Click to inspect this entry's full tactical gap metrics breakdown."}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-white/90 border-t border-slate-950 pt-3 mt-2 flex justify-between items-center">
                  <span>ID: {resume.id.substring(0, 8).toUpperCase()}...</span>
                  <span className="group-hover:text-white transition-colors">
                    {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "Recent"} • Inspect Details →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 🌟 CUSTOM MODAL COMPONENT WINDOW OVERLAY */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl mx-4 font-mono">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-xl mb-4">
              ⚠️
            </div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight">
              Confirm Record Delete
            </h3>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              Are you sure you want to permanently delete this resume matrix log? This action breaks historical assessment links and cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2 text-xs cursor-pointer font-bold text-slate-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={executeConfirmedDelete}
                className="flex-1 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer border border-rose-500/30 rounded-xl transition-all"
              >
                DELETE 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}