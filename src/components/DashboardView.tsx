"use client";

import React from "react";
import { motion, Variants } from "framer-motion"; // 🌟 Import motion
import { AnalysisResponse } from "@/types/analysis";

interface DashboardViewProps {
  data: AnalysisResponse;
  onReset: () => void;
}

// 🌟 Animation Variants for Cascading Stagger Effects
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

  // SVG Circular Math Constants
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.matchScore / 100) * circumference;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mx-auto p-6 space-y-6"
    >
      {/* Header Row */}
      <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Analysis Engine Dashboard</h1>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">Gemini Architectural Assessment Matrix</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all shadow-lg"
        >
          🔄 Reset Pipeline
        </motion.button>
      </motion.div>

      {/* Grid: Animated Score Ring + Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SVG Progress Circle Card */}
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

        {/* Executive Summary Card */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl md:col-span-2 flex flex-col justify-center shadow-xl">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 mb-3">Executive Summary Insight</span>
          <p className="text-slate-300 leading-relaxed text-sm font-normal">{data.summary}</p>
        </motion.div>
      </div>

      {/* Grid: Core Strengths + Keyword Deficits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Strengths */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            ✨ Detected Strengths
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

        {/* Keyword Gaps */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
            ⚠️ Language Deficit Matrix
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

      {/* Action Items Roadmap */}
      <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          🛠️ Concrete Optimization Roadmap
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
    </motion.div>
  );
}