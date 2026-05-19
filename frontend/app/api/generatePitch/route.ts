import { NextRequest, NextResponse } from "next/server";

import { buildPitchInputFromAnalysis, generatePitchDeck } from "@/engines/pitchDeckEngine";
import { enforceRateLimit } from "@/lib/requestGuard";
import { AnalyzeIdeaResponse, GeneratePitchPayload } from "@/types/api";
import { cleanText } from "@/utils/textCleaner";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`generatePitch:${requester}`, 12, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please retry shortly." }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as GeneratePitchPayload;
    const ideaName = cleanText(payload.ideaName ?? "");
    const ideaDescription = cleanText(payload.ideaDescription ?? "");

    if (ideaName.length < 3 || ideaDescription.length < 12) {
      return NextResponse.json({ error: "ideaName and ideaDescription are required." }, { status: 400 });
    }

    const analysis = payload.analysis as AnalyzeIdeaResponse | undefined;

    const pitchInput = analysis
      ? buildPitchInputFromAnalysis(analysis)
      : {
          ideaAnalysis: {
            ideaName,
            description: ideaDescription,
            problem: ideaDescription,
            industry: payload.industry ?? "AI software",
            targetUsers: payload.targetUsers ?? ["Startup founders", "Innovation teams"],
            technologyStack: payload.technologyStack ?? ["LLM workflows", "Analytics dashboard"],
            innovationCategory: payload.innovationCategory ?? "Applied intelligence",
            competitionLevel: payload.competitionLevel ?? "Moderate",
            suggestedImprovements: payload.suggestions ?? [],
          },
          innovationScore: payload.innovationScore ?? 62,
          marketInsights: {
            marketSizeBillionUsd: payload.marketInsights?.market_size_billion_usd ?? 8.5,
            growthForecastCagr: payload.marketInsights?.growth_forecast_cagr ?? 14,
            bestCountriesForLaunch: payload.marketInsights?.best_countries_for_launch ?? ["United States", "India"],
            summary: payload.marketInsights?.summary ?? "The market is growing quickly with strong AI adoption across digital-first teams.",
          },
        };

    const result = await generatePitchDeck(
      pitchInput.ideaAnalysis,
      pitchInput.innovationScore,
      pitchInput.marketInsights,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        slides: [
          { id: "title", title: "Title", content: "AI innovation startup pitch" },
          { id: "problem", title: "Problem", content: "Teams need faster validation before they invest time and capital in new ideas." },
          { id: "solution", title: "Solution", content: "An AI platform that scores originality, scans competitors, and gives founders a sharper execution path." },
        ],
        generatedAt: new Date().toISOString(),
        provider: "fallback",
      },
      { status: 200 },
    );
  }
}
