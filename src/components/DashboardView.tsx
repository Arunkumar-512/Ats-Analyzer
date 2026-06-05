"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { AnalysisResponse } from "@/types/analysis";

interface DashboardViewProps {
  data: AnalysisResponse;
  onReset: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function DashboardView({ data, onReset }: DashboardViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const getBadgeStyle = (importance: "High" | "Medium" | "Low") => {
    switch (importance) {
      case "High": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 stroke-emerald-500";
    if (score >= 55) return "text-amber-400 stroke-amber-500";
    return "text-rose-400 stroke-rose-500";
  };

  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: data.summary || "Fallback candidate profile matrix data...",
          jobDescription: localStorage.getItem("last_jd") || "Target technical engineer profile...", 
        }),
        
      });

      const outcome = await res.json();
      if (!res.ok) throw new Error(outcome.error || "Generation error.");

      setCoverLetter(outcome.coverLetter);
    } catch (err: any) {
      setGenError(err.message || "Could not generate cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.matchScore / 100) * circumference;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mx-auto p-6 space-y-6 print:p-0"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-slate-900 pb-5 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Analysis Engine Dashboard</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all shadow-lg"
        >
          Reset
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-4">Match Core Rating</span>
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r={radius} className="stroke-slate-800" strokeWidth="10" fill="transparent" />
              <motion.circle 
                cx="72" cy="72" r={radius} 
                className={getScoreColor(data.matchScore).split(" ")[1]} 
                strokeWidth="10" fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-4xl font-black font-mono tracking-tighter ${getScoreColor(data.matchScore).split(" ")[0]}`}>
              {data.matchScore}%
            </span>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 flex flex-col justify-center shadow-xl">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-3">Summary Insight</span>
          <p className="text-slate-300 leading-relaxed text-sm font-normal">{data.summary}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            Detected Strengths
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((strength, index) => (
              <motion.li 
                whileHover={{ x: 2 }}
                key={index} 
                className="flex gap-3 text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60"
              >
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="leading-relaxed">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            Language Deficit 
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {data.keywordGaps.map((item, index) => (
              <motion.div
                whileHover={{ scale: 1.03 }}
                key={index}
                className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm ${getBadgeStyle(item.importance)}`}
              >
                <span>{item.keyword}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-60 px-1 bg-black/30 rounded font-mono">
                  {item.importance}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl print:hidden">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          Concrete Optimization Roadmap
        </h3>
        <div className="space-y-3">
          {data.actionItems.map((action, index) => (
            <motion.div 
              whileHover={{ x: 2 }}
              key={index} 
              className="flex gap-4 items-start text-xs text-slate-300 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 transition-colors hover:border-slate-700"
            >
              <span className="w-5 h-5 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-md font-mono text-[10px] text-slate-500 font-bold shrink-0">
                {index + 1}
              </span>
              <p className="pt-0.5 leading-relaxed text-slate-300">{action}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        variants={itemVariants} 
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl print:border-none print:bg-transparent print:p-0 print:shadow-none"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              Cover Letter Tailoring Studio
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Draft an optimal, high-impact application cover letter matching your profile metrics directly to this role.
            </p>
          </div>

          {!coverLetter && (
            <motion.button
              whileHover={{ scale: isGenerating ? 1 : 1.02 }}
              whileTap={{ scale: isGenerating ? 1 : 0.98 }}
              onClick={handleGenerateLetter}
              disabled={isGenerating}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all border ${
                isGenerating
                  ? "bg-slate-950 border-slate-800 text-slate-600 animate-pulse cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-slate-100 border-purple-500/20 shadow-md shadow-purple-600/10"
              }`}
            >
              {isGenerating ? "Drafting Cover Letter..." : "Generate Letter"}
            </motion.button>
          )}
        </div>

        {genError && (
          <p className="text-xs font-mono text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl mt-2 print:hidden">
             {genError}
          </p>
        )}

        {coverLetter && (
          <div className="mt-4 border border-slate-950 bg-slate-950/40 rounded-xl p-5 relative group animate-fade-in print:mt-0 print:border-none print:bg-transparent print:p-0">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 print:hidden">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all flex items-center gap-1.5"
              >
                {copied ? "Copied!" : "Copy Layout"}
              </button>
              
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 transition-all flex items-center gap-1.5 shadow-md"
              >
                Download PDF
              </button>
            </div>
            
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed pr-12 max-h-[400px] overflow-y-auto custom-scrollbar print:text-neutral-900 print:bg-white print:p-0 print:max-h-none print:overflow-visible print:pr-0 print:font-serif print:text-sm">
              {coverLetter}
            </pre>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}