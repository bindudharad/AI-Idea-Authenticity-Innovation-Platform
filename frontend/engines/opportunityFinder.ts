"use client";

import { AnalyzeIdeaResponse } from "@/types/api";

export type OpportunityMetrics = {
  technologyGrowth: number;
  marketDemand: number;
  researchTrend: number;
  competitionLevel: number;
};

export type OpportunityArea = {
  title: string;
  reason: string;
};

export type OpportunityResult = {
  score: number;
  level: "High" | "Moderate" | "Emerging";
  areas: OpportunityArea[];
  metrics: OpportunityMetrics;
  explanation: string;
  alignmentScore: number;
};

export function computeOpportunity(analysis: AnalyzeIdeaResponse): OpportunityResult {
  const marketDemand = clamp(
    normalizeMarketDemand(
      analysis.market_insights.market_size_billion_usd,
      analysis.market_insights.growth_forecast_cagr,
    ),
  );

  const researchSignals =
    analysis.resource_scan.similar_research.length +
    (analysis.external_intelligence?.researchPapers?.length ?? 0);
  const researchTrend = clamp(40 + Math.min(60, researchSignals * 7));

  const technologyGrowth = clamp(
    45 +
      (analysis.idea_profile.technology_stack.length * 9) +
      (analysis.external_intelligence?.ideaAnalysis?.technologies.length ?? 0) * 5,
  );

  const competitionLevel = clamp(
    100 - Math.min(85, analysis.similarity_score + analysis.competitor_intelligence.competitors.length * 6),
  );

  const score =
    technologyGrowth * 0.35 +
    marketDemand * 0.3 +
    researchTrend * 0.2 +
    competitionLevel * -0.15;

  const normalizedScore = clamp(Math.max(0, score));
  const level = normalizedScore >= 80 ? "High" : normalizedScore >= 60 ? "Moderate" : "Emerging";

  const areas: OpportunityArea[] = [
    {
      title: "AI innovation validation tools",
      reason: "Low competition and high demand among startup ecosystems.",
    },
    {
      title: "AI research intelligence platforms",
      reason: "Research acceleration creates whitespace for workflow automation.",
    },
    {
      title: "Startup idea analytics systems",
      reason: "Founders need fast originality checks with investor-ready insights.",
    },
  ];

  const alignmentScore = clamp(
    50 +
      (analysis.idea_profile.problem_statement.toLowerCase().includes("analysis") ? 18 : 0) +
      (analysis.idea_profile.problem_statement.toLowerCase().includes("innovation") ? 18 : 0) +
      (analysis.idea_profile.technology_stack.join(" ").toLowerCase().includes("ai") ? 14 : 0),
  );

  return {
    score: Number(normalizedScore.toFixed(1)),
    level,
    areas,
    metrics: {
      technologyGrowth,
      marketDemand,
      researchTrend,
      competitionLevel,
    },
    explanation:
      "This innovation space shows strong potential due to rapid AI tooling growth, high market demand, and limited specialized competitors.",
    alignmentScore,
  };
}

function normalizeMarketDemand(size: number, cagr: number) {
  const sizeScore = Math.min(100, (size / 40) * 100);
  const growthScore = Math.min(100, (cagr / 18) * 100);
  return sizeScore * 0.6 + growthScore * 0.4;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
