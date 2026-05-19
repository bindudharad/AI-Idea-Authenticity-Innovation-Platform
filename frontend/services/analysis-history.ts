"use client";

import { readLatestInvestorInsights } from "@/services/latest-investor-insights";
import { readLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { AnalyzeIdeaResponse, StoredAnalysisHistoryEntry } from "@/types/api";

const ANALYSIS_HISTORY_KEY = "idea_platform_analysis_history";

export function readAnalysisHistory(): StoredAnalysisHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(ANALYSIS_HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredAnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(ANALYSIS_HISTORY_KEY);
    return [];
  }
}

export function appendAnalysisHistory(analysis: AnalyzeIdeaResponse) {
  if (typeof window === "undefined") {
    return;
  }

  const novelty = readLatestIdeaNovelty();
  const investor = readLatestInvestorInsights();
  const entry: StoredAnalysisHistoryEntry = {
    id: `${analysis.idea_name}:${Date.now()}`,
    ideaName: analysis.idea_name,
    similarityScore: analysis.similarity_score,
    innovationScore: analysis.innovation_score,
    noveltyScore: novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score),
    investorScore:
      investor?.investorScore ??
      analysis.external_intelligence?.investorDecision?.investorScore ??
      Math.max(40, Math.round((analysis.innovation_score + Number(analysis.startup_analysis.startup_potential_score ?? 60)) / 2)),
    analysisDate: new Date().toISOString(),
  };

  const history = [entry, ...readAnalysisHistory()].slice(0, 24);
  window.localStorage.setItem(ANALYSIS_HISTORY_KEY, JSON.stringify(history));
}
