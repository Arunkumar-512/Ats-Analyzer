"use client";

import { useState } from "react";
// Import your shared type here:
import { AnalysisResponse } from "@/types/analysis"; 

export default function Dashboard() {
  // Enforce that this state can either be null or strictly follow our AnalysisResponse format
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  // Example of using it when processing the response
  const handleAnalyze = async (text: string) => {
    const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ resumeText: text }) });
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