"use client";

import { appendAnalysisHistory } from "@/services/analysis-history";
import { AnalyzeIdeaResponse } from "@/types/api";

export const LATEST_ANALYSIS_KEY = "idea_platform_latest_analysis";

export function readLatestAnalysis(): AnalyzeIdeaResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_ANALYSIS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AnalyzeIdeaResponse;
  } catch {
    window.localStorage.removeItem(LATEST_ANALYSIS_KEY);
    return null;
  }
}

export function storeLatestAnalysis(analysis: AnalyzeIdeaResponse) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LATEST_ANALYSIS_KEY, JSON.stringify(analysis));
  appendAnalysisHistory(analysis);
}
