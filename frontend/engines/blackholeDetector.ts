"use client";

import { AnalyzeIdeaResponse, IntegratedIdeaAnalysisResponse } from "@/types/api";

export type BlackholeAnalysis = {
  blackholeScore: number;
  riskLevel: "Low Saturation" | "Moderate Saturation" | "High Saturation";
  recommendation: string;
  patentDensity: number;
  startupCompetition: number;
  technologyOverlap: number;
  researchDensity: number;
};

type DensityInputs = {
  patentDensity: number;
  startupCompetition: number;
  technologyOverlap: number;
  researchDensity: number;
};

export function calculateBlackholeScore({
  patentDensity,
  startupCompetition,
  technologyOverlap,
  researchDensity,
}: DensityInputs): BlackholeAnalysis {
  const blackholeScore =
    patentDensity * 0.4 +
    startupCompetition * 0.3 +
    technologyOverlap * 0.2 +
    researchDensity * 0.1;

  const rounded = clamp(blackholeScore);
  const riskLevel =
    rounded > 70 ? "High Saturation" : rounded > 45 ? "Moderate Saturation" : "Low Saturation";

  const recommendation =
    rounded > 70
      ? "Consider focusing on a niche variation of this idea."
      : rounded > 45
        ? "Differentiate with a sharper wedge and proprietary data advantage."
        : "The space looks open enough to pursue a focused innovation path.";

  return {
    blackholeScore: rounded,
    riskLevel,
    recommendation,
    patentDensity: clamp(patentDensity),
    startupCompetition: clamp(startupCompetition),
    technologyOverlap: clamp(technologyOverlap),
    researchDensity: clamp(researchDensity),
  };
}

export function buildBlackholeAnalysis(
  analysis: AnalyzeIdeaResponse,
  external?: IntegratedIdeaAnalysisResponse | null,
): BlackholeAnalysis {
  const patents = external?.patents?.length ?? analysis.resource_scan.similar_patents.length;
  const startups = external?.githubRepos?.length ?? analysis.resource_scan.similar_startups.length;
  const research = external?.wikipedia?.length ?? analysis.resource_scan.similar_research.length;

  const patentDensity = Math.min(100, 20 + patents * 8);
  const startupCompetition = Math.min(100, 18 + startups * 10);
  const researchDensity = Math.min(100, 12 + research * 9);
  const technologyOverlap = Math.min(
    100,
    10 + (external?.similarityScore ?? analysis.similarity_score) * 0.9,
  );

  return calculateBlackholeScore({
    patentDensity,
    startupCompetition,
    technologyOverlap,
    researchDensity,
  });
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}
