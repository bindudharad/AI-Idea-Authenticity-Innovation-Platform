"use client";

import {
  AnalyzeIdeaResponse,
  ExplainableAiResponse,
  IdeaCoachResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";

export type EnhancedInsightSection = {
  title: string;
  bullets: string[];
};

export type EnhancedAiResponse = {
  ideaSummary: string;
  technologies: string[];
  innovationScore: number;
  similarityScore: number;
  innovationAnalysis: string[];
  marketPotential: string[];
  riskFactors: string[];
  suggestions: string[];
  confidenceLevel: "High" | "Medium" | "Low";
  sections: EnhancedInsightSection[];
};

type InsightInput = {
  analysis: AnalyzeIdeaResponse;
  explanation?: ExplainableAiResponse | null;
  investor?: InvestorDecisionResponse | null;
  novelty?: NoveltyCheckResponse | null;
  coach?: IdeaCoachResponse | null;
};

const TECHNOLOGY_KEYWORDS = [
  "artificial intelligence",
  "ai",
  "machine learning",
  "ml",
  "blockchain",
  "iot",
  "internet of things",
  "data analytics",
  "knowledge graph",
  "nlp",
  "natural language processing",
  "computer vision",
  "robotics",
  "edge computing",
  "cloud",
  "automation",
  "predictive",
];

export function enhanceAiResponse({
  analysis,
  explanation,
  investor,
  novelty,
  coach,
}: InsightInput): EnhancedAiResponse {
  const ideaSummary = `${analysis.idea_name} targets ${analysis.idea_profile.target_users.join(", ")} by addressing ${analysis.idea_profile.problem_statement.toLowerCase()}.`;
  const technologies = unique([
    ...analysis.idea_profile.technology_stack,
    ...extractTechnologiesFromText(analysis.idea_profile.problem_statement),
    ...(analysis.external_intelligence?.ideaAnalysis?.technologies ?? []),
  ]);

  const innovationAnalysis = [
    `Originality remains ${analysis.similarity_score < 35 ? "strong" : "moderate"} because similarity is ${analysis.similarity_score.toFixed(1)}%.`,
    `Innovation score is ${analysis.innovation_score.toFixed(1)} with novelty at ${Math.round(novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score))}.`,
    `Competition is ${analysis.competitor_intelligence.competition_level}, indicating ${analysis.competitor_intelligence.competition_level.toLowerCase().includes("low") ? "clear whitespace" : "a crowded landscape"}.`,
    ...(explanation?.bullets ?? []),
  ].filter(Boolean);

  const marketPotential = [
    `Market size: $${analysis.market_insights.market_size_billion_usd.toFixed(1)}B`,
    `Growth forecast: ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR`,
    `Best launch regions: ${analysis.market_insights.best_countries_for_launch.join(", ")}`,
  ];

  const riskFactors = [
    `Risk level: ${analysis.future_impact.risk_level}`,
    ...analysis.idea_profile.possible_risks.slice(0, 3),
  ].filter(Boolean);

  const suggestions = [
    coach?.enhancedIdeaVersion,
    coach?.futureVersion,
    coach?.startupScalableVersion,
    ...analysis.suggestions.slice(0, 3),
    "Integrate additional research and patent sources to deepen originality detection.",
  ].filter(Boolean) as string[];

  const confidenceLevel = computeConfidence({
    analysis,
    explanation,
    investor,
    novelty,
  });

  const sections: EnhancedInsightSection[] = [
    {
      title: "Idea Summary",
      bullets: [ideaSummary],
    },
    {
      title: "Key Technologies",
      bullets: technologies.length ? technologies : ["AI", "analytics", "workflow automation"],
    },
    {
      title: "Innovation Analysis",
      bullets: innovationAnalysis,
    },
    {
      title: "Market Potential",
      bullets: marketPotential,
    },
    {
      title: "Risk Factors",
      bullets: riskFactors,
    },
    {
      title: "Improvement Suggestions",
      bullets: suggestions,
    },
  ];

  return {
    ideaSummary,
    technologies,
    innovationScore: analysis.innovation_score,
    similarityScore: analysis.similarity_score,
    innovationAnalysis,
    marketPotential,
    riskFactors,
    suggestions,
    confidenceLevel,
    sections,
  };
}

function extractTechnologiesFromText(text: string) {
  const lower = text.toLowerCase();
  return TECHNOLOGY_KEYWORDS.filter((keyword) => lower.includes(keyword)).map((keyword) => toTitle(keyword));
}

function toTitle(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))].slice(0, 10);
}

function computeConfidence({
  analysis,
  explanation,
  investor,
  novelty,
}: {
  analysis: AnalyzeIdeaResponse;
  explanation?: ExplainableAiResponse | null;
  investor?: InvestorDecisionResponse | null;
  novelty?: NoveltyCheckResponse | null;
}) {
  let score = 0;
  if (analysis.external_intelligence) score += 1;
  if (analysis.resource_scan.similar_research.length > 0) score += 1;
  if (analysis.resource_scan.similar_patents.length > 0) score += 1;
  if (analysis.resource_scan.similar_startups.length > 0) score += 1;
  if (explanation) score += 1;
  if (investor) score += 1;
  if (novelty) score += 1;

  if (score >= 5) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}
