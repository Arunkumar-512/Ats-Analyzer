// types/analysis.ts

export interface KeywordGap {
  keyword: string;
  importance: "High" | "Medium" | "Low";
}

export interface AnalysisResponse {
  matchScore: number;
  summary: string;
  strengths: string[];
  keywordGaps: KeywordGap[];
  actionItems: string[];
}