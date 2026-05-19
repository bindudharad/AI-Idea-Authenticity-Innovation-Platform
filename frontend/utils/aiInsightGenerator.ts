"use client";

import {
  AnalyzeIdeaResponse,
  ExplainableAiResponse,
  IdeaCoachResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";

export type AiInsightSection = {
  title: string;
  bullets: string[];
};

export type AiInsightResult = {
  ideaSummary: string;
  sections: AiInsightSection[];
};

type InsightInput = {
  analysis: AnalyzeIdeaResponse;
  explanation?: ExplainableAiResponse | null;
  investor?: InvestorDecisionResponse | null;
  novelty?: NoveltyCheckResponse | null;
  coach?: IdeaCoachResponse | null;
};

export function buildAiInsights({
  analysis,
  explanation,
  investor,
  novelty,
  coach,
}: InsightInput): AiInsightResult {
  const ideaSummary = `${analysis.idea_name} targets ${analysis.idea_profile.target_users.join(", ")} by addressing ${analysis.idea_profile.problem_statement.toLowerCase()}.`;

  const keyTechnologies = [
    ...analysis.idea_profile.technology_stack,
    ...(analysis.external_intelligence?.ideaAnalysis?.technologies ?? []),
  ].filter(Boolean);

  const innovationBullets = [
    `Innovation score: ${analysis.innovation_score.toFixed(1)}`,
    `Similarity score: ${analysis.similarity_score.toFixed(1)}%`,
    `Novelty score: ${Math.round(novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score))}`,
    ...(explanation?.bullets ?? []),
  ];

  const marketBullets = [
    `Market size: $${analysis.market_insights.market_size_billion_usd.toFixed(1)}B`,
    `Growth forecast: ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR`,
    `Best launch countries: ${analysis.market_insights.best_countries_for_launch.join(", ")}`,
  ];

  const riskBullets = [
    `Risk level: ${analysis.future_impact.risk_level}`,
    ...analysis.idea_profile.possible_risks.slice(0, 3),
  ];

  const improvementBullets = [
    coach?.enhancedIdeaVersion,
    coach?.futureVersion,
    coach?.startupScalableVersion,
    ...analysis.suggestions.slice(0, 3),
  ].filter(Boolean) as string[];

  return {
    ideaSummary,
    sections: [
      {
        title: "Idea Summary",
        bullets: [ideaSummary],
      },
      {
        title: "Key Technologies",
        bullets: keyTechnologies.length ? keyTechnologies : ["AI", "analytics", "workflow automation"],
      },
      {
        title: "Innovation Analysis",
        bullets: innovationBullets.filter(Boolean),
      },
      {
        title: "Market Potential",
        bullets: marketBullets.filter(Boolean),
      },
      {
        title: "Risks",
        bullets: riskBullets.filter(Boolean),
      },
      {
        title: "Improvement Suggestions",
        bullets: improvementBullets,
      },
    ],
  };
}

