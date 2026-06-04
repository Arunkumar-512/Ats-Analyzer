// src/app/dashboard/report/[id]/loading.tsx
import React from "react";

export default function ReportLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4 animate-pulse">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-40 bg-slate-900 rounded-md" />

        {/* Header Row Skeleton */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-5">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-900 rounded-xl" />
            <div className="h-3 w-48 bg-slate-900 rounded-md" />
          </div>
          <div className="h-10 w-32 bg-slate-900 rounded-xl" />
        </div>

        {/* Grid: Circle + Summary Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-900 h-48 rounded-2xl flex flex-col items-center justify-center" />
          <div className="bg-slate-900/50 border border-slate-900 h-48 rounded-2xl md:col-span-2" />
        </div>

        {/* Grid: Strengths + Deficits Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-900 h-64 rounded-2xl" />
          <div className="bg-slate-900/50 border border-slate-900 h-64 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}