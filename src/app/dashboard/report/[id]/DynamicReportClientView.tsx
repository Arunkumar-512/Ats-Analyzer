"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardView from "@/components/DashboardView";
import { AnalysisResponse } from "@/types/analysis";

interface DynamicReportClientViewProps {
  reportData: AnalysisResponse;
}

export default function DynamicReportClientView({ reportData }: DynamicReportClientViewProps) {
  const router = useRouter();

  return (
    <DashboardView 
      data={reportData} 
      onReset={() => {
        // Since we are on a dedicated sub-route, resetting should slide the developer back to their main workspace overview!
        router.push("/dashboard");
      }} 
    />
  );
}