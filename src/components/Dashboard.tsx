"use client";

import { useState } from "react";
import { AnalysisResponse } from "@/types/analysis"; 

export default function Dashboard() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async (text: string) => {
    const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ resumeText: text }),credentials: "include" });
    const data: AnalysisResponse = await res.json();
    setAnalysisResult(data);
  };

  return (
    <div>
      {analysisResult && (
        <p>Your match score is: {analysisResult.matchScore}/100</p>
      )}
    </div>
  );
}