"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReportError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the application layer mismatch to your telemetry console safely
    console.error("Dynamic Report Subtree Breakdown:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 font-mono">
      <div className="max-w-md w-full border border-rose-500/10 bg-slate-900/20 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-lg font-bold text-slate-200 mt-4 tracking-tight">
          DATA HYDRATION FAILURE
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
          The structural JSON schematic for this analytical report entry could not be parsed safely or your database connection timed out.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-xl transition-all"
          >
            🔄 Attempt Recovery Loop
          </button>

          <Link
            href="/dashboard"
            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl transition-all block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}