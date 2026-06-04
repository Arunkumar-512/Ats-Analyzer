"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 🌟 Import motion tools
import DropZone from "@/components/DropZone";
import DashboardView from "@/components/DashboardView";
import { AnalysisResponse } from "@/types/analysis";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "parsing" | "analyzing" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");

  const handleResumePipeline = async (file: File) => {
    setError(null);
    setAnalysisResult(null);
    setPipelineStatus("parsing");

    try {
      const parseFormData = new FormData();
      parseFormData.append("file", file);

      const parseRes = await fetch("/api/parse", { method: "POST", body: parseFormData });
      const parseData = await parseRes.json();

      if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse text from PDF.");

      setPipelineStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: parseData.text, jobDescription }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Gemini processing engine fault.");

      setAnalysisResult(analyzeData as AnalysisResponse);
      setPipelineStatus("success");

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setPipelineStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 overflow-x-hidden">
      {/* AnimatePresence handles smooth fade-outs when layouts unmount */}
      <AnimatePresence mode="wait">
        {pipelineStatus !== "success" || !analysisResult ? (
          <motion.div 
            key="input-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8 max-w-4xl mx-auto w-full"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent">
                AI Resume Optimizer
              </h1>
              <p className="text-slate-400 text-sm">
                Upload your resume and paste a target job description to look for keyword and metric alignment gaps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Job Description Card with border glow on focus */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/5">
                <label className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
                  🎯 Target Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job details, requirements, or tech stack checklist here..."
                  disabled={pipelineStatus !== "idle"}
                  className="w-full h-56 bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-slate-700 transition-all resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="h-full flex flex-col justify-center">
                <DropZone onFileSelect={handleResumePipeline} status={pipelineStatus} error={error} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "backOut" }}
          >
            <DashboardView 
              data={analysisResult} 
              onReset={() => {
                setAnalysisResult(null);
                setPipelineStatus("idle");
                setError(null);
                setJobDescription("");
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}