import { NextRequest, NextResponse } from "next/server";

import { requestGroqJson } from "@/lib/groqClient";
import { ExplainableAiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ideaName?: string;
      innovationScore?: number;
      similarityScore?: number;
      competitionLevel?: string;
      technologyNovelty?: number;
      marketPotential?: string;
    };

    const innovationScore = Number(body.innovationScore ?? 0);
    const similarityScore = Number(body.similarityScore ?? 0);
    const technologyNovelty = Number(body.technologyNovelty ?? Math.max(45, innovationScore));
    const competitionLevel = body.competitionLevel ?? "moderate";
    const marketPotential = body.marketPotential ?? "promising";

    const fallback: ExplainableAiResponse = {
      explanationTitle: "Innovation Score Explanation",
      bullets: [
        `${similarityScore >= 60 ? "higher" : similarityScore >= 35 ? "moderate" : "low"} patent and ecosystem similarity shaped the baseline score.`,
        `${technologyNovelty >= 70 ? "strong" : "emerging"} technology novelty lifted the originality outlook.`,
        `${competitionLevel} market competition influenced defensibility.`,
        `${marketPotential} market potential improved the final recommendation.`,
      ],
      summary:
        innovationScore >= 75
          ? "The platform sees meaningful whitespace with enough commercial upside to justify a strong innovation rating."
          : "The score reflects a concept with promise, but it still overlaps enough with existing signals that differentiation work matters.",
      provider: "fallback",
    };

    const generated = await requestGroqJson<ExplainableAiResponse>(
      `Generate a short explainable AI summary for why this startup idea received its innovation score.

Idea name: ${body.ideaName ?? "Unknown idea"}
Innovation score: ${innovationScore}
Similarity score: ${similarityScore}
Technology novelty: ${technologyNovelty}
Competition level: ${competitionLevel}
Market potential: ${marketPotential}

Return strict JSON with keys:
- explanationTitle (string)
- bullets (array of exactly 4 short bullet strings)
- summary (string)
- provider (string, set to "groq")`,
      fallback,
      'Return strict JSON only. "provider" must be "groq".',
    );

    return NextResponse.json({
      ...generated,
      provider: generated.provider ?? "groq",
    });
  } catch {
    return NextResponse.json(
      {
        explanationTitle: "Innovation Score Explanation",
        bullets: [
          "The platform combined similarity, novelty, and competition signals.",
          "Technology differentiation supported originality.",
          "Competitive density lowered the maximum possible score.",
          "Market upside still kept the idea commercially attractive.",
        ],
        summary: "The system returned a fallback explanation because the live explanation service was unavailable.",
        provider: "fallback",
      } satisfies ExplainableAiResponse,
      { status: 200 },
    );
  }
}
