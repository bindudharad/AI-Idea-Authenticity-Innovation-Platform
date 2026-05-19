"use client";

import {
  AnalyzeIdeaResponse,
  ExplainableAiResponse,
  IdeaCoachResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";
import { enhanceAiResponse, EnhancedAiResponse } from "@/utils/responseEnhancer";

export type FormattedAiResponse = EnhancedAiResponse;

type FormatterInput = {
  analysis: AnalyzeIdeaResponse;
  explanation?: ExplainableAiResponse | null;
  investor?: InvestorDecisionResponse | null;
  novelty?: NoveltyCheckResponse | null;
  coach?: IdeaCoachResponse | null;
};

export function formatAiResponse(input: FormatterInput): FormattedAiResponse {
  const enhanced = enhanceAiResponse(input);

  const sections = [
    ...enhanced.sections.filter((section) => section.title !== "Analysis Confidence"),
    {
      title: "Analysis Confidence",
      bullets: [`Confidence level: ${enhanced.confidenceLevel}`],
    },
  ];

  return {
    ...enhanced,
    sections,
  };
}
