interface DashboardProps {
  data: {
    matchScore: number;
    summary: string;
    strengths: string[];
    keywordGaps: { keyword: string; importance: "High" | "Medium" | "Low" }[];
    actionItems: string[];
  };
  onReset: () => void;
}

export function AnalysisDashboard({ data, onReset }: DashboardProps) {
  return (
    <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 text-slate-100 min-h-screen">
      {/* Header Matrix Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wide font-mono">Analysis Engine Dashboard</h1>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:bg-slate-800 text-slate-300 transition-all shadow-md"
        >
          🔄 Reset Pipeline
        </button>
      </div>

      {/* Top Section Grid (Match Score & Executive Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Match Core Rating Ring */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-4 block">Match Core Rating</span>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circle Track */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#10b981" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * data.matchScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-2xl font-mono font-extrabold text-emerald-400">{data.matchScore}%</span>
          </div>
        </div>

        {/* Executive Summary Block */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6 md:col-span-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2 block">Executive Summary Insight</span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Bottom Section Grid (Strengths & Language Deficit Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detected Strengths */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6">
          <h3 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-2 mb-4">
            ✨ Detected Strengths
          </h3>
          <div className="space-y-3">
            {data.strengths.map((strength, i) => (
              <div key={i} className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Language Deficit Matrix (Keyword Gaps) */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-6">
          <h3 className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase flex items-center gap-2 mb-4">
            ⚠️ Language Deficit Matrix
          </h3>
          <div className="space-y-2">
            {data.keywordGaps.map((gap, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900/30 border border-slate-900 rounded-lg p-3 text-xs">
                <span className="text-slate-300 font-mono">{gap.keyword}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  gap.importance === "High" 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                    : gap.importance === "Medium"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {gap.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}