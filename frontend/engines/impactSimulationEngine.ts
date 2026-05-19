"use client";

import { AnalyzeIdeaResponse } from "@/types/api";

export type ImpactSimulationResult = {
  technologyImpact: string;
  economicImpact: string;
  socialImpact: string;
  scores: {
    technology: number;
    economic: number;
    social: number;
  };
};

export function simulateImpact(analysis: AnalyzeIdeaResponse): ImpactSimulationResult {
  const technology = clamp(analysis.radar_metrics.technology_readiness ?? 72);
  const economic = clamp(analysis.market_insights.market_size_billion_usd * 2 + analysis.market_insights.growth_forecast_cagr);
  const social = clamp(analysis.future_impact.social_impact ?? analysis.future_impact.adoption_probability ?? 70);

  return {
    technologyImpact: classify(technology),
    economicImpact: classify(economic),
    socialImpact: classify(social),
    scores: {
      technology,
      economic,
      social,
    },
  };
}

function classify(score: number) {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Emerging";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
