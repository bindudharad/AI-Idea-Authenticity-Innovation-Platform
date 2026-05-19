import { NextRequest, NextResponse } from "next/server";

import { runAgentPipeline } from "@/engines/agentOrchestrator";
import { enforceRateLimit } from "@/lib/requestGuard";
import { cleanText } from "@/utils/textCleaner";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`analyzeIdea:${requester}`, 15, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please retry shortly." }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as { ideaName?: string; ideaDescription?: string; idea_type?: string };
    const ideaName = cleanText(payload.ideaName ?? "");
    const ideaDescription = cleanText(payload.ideaDescription ?? "");

    if (ideaName.length < 3 || ideaDescription.length < 12) {
      return NextResponse.json({ error: "ideaName and ideaDescription are required." }, { status: 400 });
    }

    return NextResponse.json(
      await runAgentPipeline({
        ideaName,
        ideaDescription,
        ideaType: payload.idea_type === "business" ? "business" : "startup",
      }),
    );
  } catch {
    return NextResponse.json(
      {
        ideaAnalysis: { keywords: [], technologies: [], industries: [], targetUsers: [], problems: [], provider: "fallback" },
        keywords: [],
        patents: [],
        wikipedia: [],
        githubRepos: [],
        similarityScore: 0,
        innovationScore: 50,
        closestMatches: [],
        matchingResources: [],
        improvements: [],
        impactPrediction: {
          marketPotential: "Medium",
          adoptionProbability: 50,
          riskLevel: "Moderate",
        },
        ideaEvolution: [],
        novelty: {
          noveltyScore: 50,
          noveltyLevel: "Moderately Innovative",
          relatedPatents: [],
          relatedTechnologies: [],
          similarityScore: 0,
          patentOverlap: 0,
          technologyOverlap: 0,
          competitionDensity: 0,
          patentOverlapPenalty: 1,
          technologyOverlapPenalty: 1,
        },
        investorDecision: {
          investorScore: 50,
          fundingProbability: 46,
          riskLevel: "Moderate",
          marketPotential: "Promising niche opportunity",
          recommendation: "Strengthen differentiation and demand proof before fundraising.",
          marketOpportunityScore: 56,
          competitionScore: 52,
          technologyFeasibilityScore: 61,
          riskScore: 48,
          innovationScore: 50,
          strategicAnalysis: [],
        },
        pitchDeck: {
          slides: [],
          generatedAt: new Date().toISOString(),
          provider: "fallback",
        },
        innovationMap: {
          data: [],
        },
        uniquenessScore: 100,
        dashboardSummary: {
          innovationScore: 50,
          similarityScore: 0,
          noveltyScore: 50,
          investorScore: 50,
          marketPotential: "Promising niche opportunity",
        },
        radarMetrics: {
          innovation: 50,
          marketPotential: 56,
          technologyReadiness: 61,
          competition: 52,
          risk: 52,
        },
        ideaGraph: { nodes: [], edges: [] },
        agentStatus: {},
        error: "External analysis failed. Returned fallback response.",
      },
      { status: 200 },
    );
  }
}
