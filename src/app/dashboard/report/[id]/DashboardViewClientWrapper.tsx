"use client";

import React, { useState } from "react";

interface DashboardViewClientWrapperProps {
  initialData: {
    matchScore: number;
    summary: string;
    strengths: string[];
    keywordGaps: Array<{ keyword: string; importance: string }>;
    actionItems: string[];
    coverLetter?: string; // 🌟 Added cover letter support
  };
}

export default function DashboardViewClientWrapper({ initialData }: DashboardViewClientWrapperProps) {
  const [copied, setCopied] = useState(false);

  // Fallback template if the record doesn't have a cover letter compiled yet
  const coverLetterText = initialData.coverLetter || `[Your Name]\n[Your Contact Information]\n\nDear Hiring Team,\n\nI am writing to express my strong interest in this position. Based on the matched evaluation profile showing a ${initialData.matchScore}% core alignment, my background closely tracks with your technical requirements.\n\n${initialData.summary}\n\nThank you for your time and consideration.\n\nSincerely,\n[Applicant]`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🌟 Clean CSS-print driver invocation
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto w-full mt-6 space-y-8 font-sans">
      
      {/* SECTION 1: Metrics Overview Grid (Hidden during PDF download print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Match Ring Card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-slate-800">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {initialData.matchScore}%
            </span>
          </div>
          <h4 className="text-xs font-mono text-slate-400 mt-4 uppercase tracking-wider">Overall Match Vector</h4>
        </div>

        {/* Executive Overview Summary */}
        <div className="md:col-span-2 bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-bold font-mono uppercase text-slate-200 mb-3 tracking-tight">Executive Assessment</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">{initialData.summary}</p>
        </div>
      </div>

      {/* SECTION 2: Gaps & Actions Lists (Hidden during PDF download print) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-bold font-mono uppercase text-rose-400 mb-3 tracking-tight">🚨 Key Skill Deficits</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            {initialData.keywordGaps?.map((gap, index) => (
              <li key={index} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                <span className="font-mono text-slate-300">{gap.keyword}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">{gap.importance}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
          <h3 className="text-sm font-bold font-mono uppercase text-emerald-400 mb-3 tracking-tight">⚡ Action Items</h3>
          <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
            {initialData.actionItems?.map((item, index) => (
              <li key={index} className="leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* SECTION 3: The Custom Cover Letter Section */}
      <div className="border border-slate-900 bg-slate-900/20 rounded-2xl overflow-hidden print:border-none print:bg-transparent print:p-0">
        
        {/* Controls Toolbar Header (Hidden during PDF print export) */}
        <div className="bg-slate-950/60 border-b border-slate-900 px-6 py-4 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-tight">✉️ Tailored Cover Letter</h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">AI-optimized structural alignment framework copy.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-all"
            >
              {copied ? "✅ COPIED!" : "📋 COPY TEXT"}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all"
            >
              🖨️ DOWNLOAD PDF
            </button>
          </div>
        </div>

        {/* Dynamic Presentation Canvas */}
        <div className="p-8 md:p-10 bg-slate-950/30 font-sans print:bg-white print:text-black print:p-0">
          <div className="max-w-2xl mx-auto text-sm text-slate-300 leading-relaxed whitespace-pre-wrap select-text selection:bg-emerald-500/30 font-serif print:text-neutral-900 print:leading-normal">
            {coverLetterText}
          </div>
        </div>

      </div>

    </div>
  );
}