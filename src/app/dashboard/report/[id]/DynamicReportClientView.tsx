"use client";

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
        router.push("/dashboard");
      }} 
    />
  );
}