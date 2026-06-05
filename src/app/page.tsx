"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DropZone from "@/components/DropZone";
import DashboardView from "@/components/DashboardView";
import { AnalysisResponse } from "@/types/analysis";

export default function Home() {
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResponse | null>(null);

  const [pipelineStatus, setPipelineStatus] = useState<
    "idle" | "parsing" | "analyzing" | "success"
  >("idle");

  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const handleResumePipeline = async (file: File) => {
    setError(null);
    setAnalysisResult(null);
    setPipelineStatus("parsing");

    try {
      const parseFormData = new FormData();
      parseFormData.append("file", file);

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        body: parseFormData,
        credentials: "include"
      });

      const parseData = await parseRes.json();

      if (!parseRes.ok)
        throw new Error(parseData.error || "Failed to parse text from PDF.");

      setPipelineStatus("analyzing");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: parseData.text,
          jobDescription,
          fileName: file.name,
        }),
        credentials: "include"
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok)
        throw new Error(
          analyzeData.error || "Gemini processing engine fault."
        );

      setAnalysisResult(analyzeData as AnalysisResponse);
      setPipelineStatus("success");
    } catch (err: any) {
      console.error("Pipeline Exception Captured:", err);
      setError(err.message || "An unexpected error occurred.");
      setPipelineStatus("idle");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 pt-30 px-4 py-12 text-stone-800 print:bg-white print:text-black print:py-0 print:px-0">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-slate-200/30 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {pipelineStatus !== "success" || !analysisResult ? (
          <motion.div
            key="input-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto w-full max-w-6xl space-y-12 print:hidden"
          >
            {/* Hero Section */}
            <div className="text-center space-y-5">
              <div className="inline-flex items-center rounded-full border border-slate-400 bg-white/70 px-4 py-2 text-sm font-medium text-black-900 backdrop-blur-sm">
                AI-Powered Resume Analysis
              </div>

              <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
                <span className="bg-gradient-to-r from-white via-slate-300 to-white/70 bg-clip-text text-transparent">
                  Resume Optimizer
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80">
                Upload your resume and compare it against a target job
                description to uncover ATS gaps, missing keywords, and
                improvement opportunities.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Job Description Card */}
              <div className="rounded-3xl border border-slate-100 bg-slate/80 p-6 shadow-lg shadow-slate-100/50 backdrop-blur-xl">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white/80">
                    Target Job Description
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    Optional, but recommended for better ATS and keyword
                    matching.
                  </p>
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={pipelineStatus !== "idle"}
                  placeholder="Paste the job requirements, responsibilities, tech stack, or role description here..."
                  className="h-72 w-full resize-none rounded-2xl border border-black-100 bg-white/80 p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-600 focus:border-black-300 focus:outline-none focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* Upload Card */}
              <div className="rounded-3xl border border-slate-100 bg-slate/80 p-6 shadow-lg shadow-slate-100/50 backdrop-blur-xl">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white/80">
                    Upload Resume
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    Supports PDF resumes. AI will analyze formatting, ATS
                    compatibility, skills, and experience alignment.
                  </p>
                </div>

                <div className="flex h-full min-h-[320px] items-center justify-center">
                  <DropZone
                    onFileSelect={handleResumePipeline}
                    status={pipelineStatus}
                    error={error}
                  />
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate/70 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-semibold text-white/80">ATS Optimization</h3>
                <p className="mt-2 text-sm text-white/60">
                  Discover missing keywords and improve recruiter visibility.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate/70 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-semibold text-white/80">Resume Scoring</h3>
                <p className="mt-2 text-sm text-white/60">
                  Get an overall score with detailed strengths and weaknesses.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate/70 p-5 shadow-sm backdrop-blur-sm">
                <h3 className="font-semibold text-white/80">Actionable Insights</h3>
                <p className="mt-2 text-sm text-white/60">
                  Receive AI-powered suggestions to improve your chances.
                </p>
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
            className="mx-auto w-full max-w-7xl"
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