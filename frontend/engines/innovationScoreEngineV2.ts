"use client";

import {
  AnalyzeIdeaResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";

export type InnovationScoreBreakdown = {
  originality: number;
  technology: number;
  marketPotential: number;
  researchAlignment: number;
  competition: number;
  impact: number;
};

export type InnovationScoreV2Result = {
  score: number;
  category: string;
  breakdown: InnovationScoreBreakdown;
  explanation: string[];
};

const WEIGHTS = {
  originality: 0.3,
  technology: 0.2,
  marketPotential: 0.15,
  researchAlignment: 0.1,
  competition: 0.1,
  impact: 0.15,
};

export function computeInnovationScoreV2(
  analysis: AnalyzeIdeaResponse,
  novelty: NoveltyCheckResponse | null,
  investor: InvestorDecisionResponse | null,
): InnovationScoreV2Result {
  const originality = clamp(novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score));
  const technology = clamp(analysis.radar_metrics.technology_readiness ?? analysis.radar_metrics.complexity ?? 70);
  const marketPotential = clamp(
    normalizeMarketScore(
      analysis.market_insights.market_size_billion_usd,
      analysis.market_insights.growth_forecast_cagr,
    ),
  );
  const researchSignals =
    analysis.resource_scan.similar_research.length +
    (analysis.external_intelligence?.researchPapers?.length ?? 0);
  const researchAlignment = clamp(40 + Math.min(60, researchSignals * 6));
  const competition = clamp(mapCompetitionScore(analysis.competitor_intelligence.competition_level, analysis.similarity_score));
  const impact = clamp(
    analysis.future_impact.social_impact ??
      analysis.future_impact.adoption_probability ??
      investor?.marketOpportunityScore ??
      70,
  );

  const breakdown: InnovationScoreBreakdown = {
    originality,
    technology,
    marketPotential,
    researchAlignment,
    competition,
    impact,
  };

  const weightedScore =
    originality * WEIGHTS.originality +
    technology * WEIGHTS.technology +
    marketPotential * WEIGHTS.marketPotential +
    researchAlignment * WEIGHTS.researchAlignment +
    competition * WEIGHTS.competition +
    impact * WEIGHTS.impact;

  const score = clamp(Number(weightedScore.toFixed(1)));

  return {
    score,
    category: scoreCategory(score),
    breakdown,
    explanation: buildExplanation(breakdown, analysis),
  };
}

function normalizeMarketScore(marketSize: number, cagr: number) {
  const sizeScore = Math.min(100, (marketSize / 50) * 100);
  const growthScore = Math.min(100, (cagr / 20) * 100);
  return sizeScore * 0.6 + growthScore * 0.4;
}

function mapCompetitionScore(level: string, similarity: number) {
  const base = 100 - similarity;
  const lower = level.toLowerCase();
  if (lower.includes("low")) return base + 10;
  if (lower.includes("high")) return base - 8;
  return base;
}

function scoreCategory(score: number) {
  if (score >= 90) return "Breakthrough Innovation";
  if (score >= 75) return "High Innovation";
  if (score >= 60) return "Moderate Innovation";
  if (score >= 40) return "Incremental Idea";
  return "Low Innovation";
}

function buildExplanation(breakdown: InnovationScoreBreakdown, analysis: AnalyzeIdeaResponse) {
  return [
    `Originality is ${qualify(breakdown.originality)} due to ${
      analysis.similarity_score < 30 ? "low patent similarity" : "noticeable overlap with existing solutions"
    }.`,
    `Technology strength is ${qualify(breakdown.technology)} based on the maturity of the stack.`,
    `Market potential is ${qualify(breakdown.marketPotential)} with ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR.`,
    `Competition is ${qualify(breakdown.competition)} given current market density.`,
    `Impact outlook is ${qualify(breakdown.impact)} driven by adoption projections.`,
  ];
}

function qualify(score: number) {
  if (score >= 80) return "very strong";
  if (score >= 65) return "strong";
  if (score >= 50) return "moderate";
  return "emerging";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
