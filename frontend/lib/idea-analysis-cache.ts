import { db } from "@/lib/db";
import { runAgentPipeline } from "@/engines/agentOrchestrator";
import type { AnalyzeIdeaResponse, IntegratedIdeaAnalysisResponse } from "@/types/api";
import type { PlatformMode } from "@/types/idea";

type CachedIdeaAnalysisInput = {
  ideaName: string;
  ideaDescription: string;
  ideaType: "startup" | "business";
  userId?: string | null;
  teamId?: string | null;
  isPublic?: boolean;
  mode?: PlatformMode;
};

const memoryCache = new Map<string, AnalyzeIdeaResponse>();

export async function getOrCreateIdeaAnalysis(input: CachedIdeaAnalysisInput) {
  const {
    ideaName,
    ideaDescription,
    ideaType,
    userId,
    teamId,
    isPublic = false,
    mode = ideaType === "business" ? "business" : "hackathon",
  } = input;

  if (userId) {
    const existing = await db.idea.findFirst({
      where: {
        title: ideaName,
        description: ideaDescription,
        ...(teamId ? { teamId } : { userId }),
      },
      include: {
        analysisResults: true,
        team: true,
      },
    });

    if (existing) {
      return {
        idea: existing,
        result: existing.result as AnalyzeIdeaResponse,
        cached: true,
      };
    }
  }

  const cacheKey = JSON.stringify({
    ideaName: ideaName.toLowerCase(),
    ideaDescription: ideaDescription.toLowerCase(),
    ideaType,
    teamId: teamId ?? null,
  });

  if (!userId && memoryCache.has(cacheKey)) {
    return {
      idea: null,
      result: memoryCache.get(cacheKey)!,
      cached: true,
    };
  }

  const pipelineResult = await runAgentPipeline({
    ideaName,
    ideaDescription,
    ideaType,
  });
  const result = normalizePipelineAnalysis({
    ideaName,
    ideaDescription,
    ideaType,
    mode,
    pipelineResult,
  });

  if (!userId) {
    memoryCache.set(cacheKey, result);
    return {
      idea: null,
      result,
      cached: false,
    };
  }

  const savedIdea = await db.idea.create({
    data: {
      title: ideaName,
      description: ideaDescription,
      mode,
      ideaType,
      isPublic,
      innovationScore: result.innovation_score,
      latestSimilarityScore: result.similarity_score,
      result,
      userId,
      teamId,
    },
    include: {
      analysisResults: true,
      team: true,
    },
  });

  return {
    idea: savedIdea,
    result,
    cached: false,
  };
}

function normalizePipelineAnalysis({
  ideaName,
  ideaDescription,
  ideaType,
  mode,
  pipelineResult,
}: {
  ideaName: string;
  ideaDescription: string;
  ideaType: "startup" | "business";
  mode: PlatformMode;
  pipelineResult: IntegratedIdeaAnalysisResponse;
}): AnalyzeIdeaResponse {
  const marketPotential = pipelineResult.investorDecision?.marketPotential ?? pipelineResult.impactPrediction?.marketPotential ?? "Medium";
  const adoptionProbability = pipelineResult.impactPrediction?.adoptionProbability ?? 60;
  const riskLevel = pipelineResult.impactPrediction?.riskLevel ?? pipelineResult.investorDecision?.riskLevel ?? "Moderate";
  const marketOpportunityScore = pipelineResult.investorDecision?.marketOpportunityScore ?? 62;
  const competitionScore = pipelineResult.investorDecision?.competitionScore ?? 55;
  const technologyFeasibilityScore = pipelineResult.investorDecision?.technologyFeasibilityScore ?? 65;
  const technologyStack = pipelineResult.ideaAnalysis.technologies;
  const targetUsers = pipelineResult.ideaAnalysis.targetUsers;
  const riskItems =
    pipelineResult.novelty && pipelineResult.novelty.similarityScore >= 65
      ? ["High overlap with existing solutions", "Needs stronger positioning against incumbents"]
      : ["Execution risk", "Need stronger demand validation"];

  return {
    idea_name: ideaName,
    mode,
    idea_type: ideaType,
    similarity_score: pipelineResult.similarityScore,
    innovation_score: pipelineResult.innovationScore,
    copy_claim_warning:
      pipelineResult.similarityScore >= 70
        ? "Similar project patterns detected. Sharpen differentiation before launch."
        : "No direct copy-claim pattern detected across the current signal set.",
    top_similar_projects: pipelineResult.closestMatches.map((match) => ({
      title: match.title,
      description: match.text,
      source: match.source,
      mode,
      similarity_score: match.similarity,
    })),
    idea_profile: {
      industry: pipelineResult.ideaAnalysis.industries[0] ?? "AI software",
      technology_stack: technologyStack,
      target_users: targetUsers,
      problem_statement: pipelineResult.ideaAnalysis.problems[0] ?? ideaDescription,
      possible_risks: riskItems,
      innovation_category: pipelineResult.ideaAnalysis.industries[0]
        ? `${pipelineResult.ideaAnalysis.industries[0]} intelligence`
        : "Applied AI innovation",
    },
    resource_scan: {
      similar_patents: pipelineResult.patents.map((item) => ({
        title: item.title,
        applicant: item.applicant,
        patentNumber: item.patentNumber,
        filingDate: item.filingDate,
      })),
      similar_research: (pipelineResult.researchPapers ?? []).map((item) => ({
        title: item.title,
        author: item.author,
        year: item.year,
        url: item.url,
        relevanceScore: item.relevanceScore,
      })),
      similar_startups: pipelineResult.githubRepos.map((item) => ({
        title: item.name,
        description: item.description,
        stars: item.stars,
        url: item.url,
      })),
      related_technologies: technologyStack.map((item, index) => ({
        name: item,
        fit: Math.max(65, 92 - index * 7),
      })),
    },
    innovation_breakdown: {
      originality: Math.max(0, 100 - pipelineResult.similarityScore),
      technology_novelty: Math.round((pipelineResult.technologyNovelty ?? 6) * 10),
      market_uniqueness: Math.round(Math.max(45, pipelineResult.innovationScore - 8)),
    },
    suggestions: pipelineResult.improvements ?? [],
    judging_scores: {
      innovation: Math.round(pipelineResult.innovationScore / 10),
      technical_complexity: Math.round(technologyFeasibilityScore / 10),
      real_world_impact: Math.round(adoptionProbability / 10),
      overall: Number(((pipelineResult.innovationScore / 10 + adoptionProbability / 10) / 2).toFixed(1)),
    },
    startup_analysis: {
      market_demand: Math.round(marketOpportunityScore),
      competition_level: competitionScore,
      scalability: Math.round(technologyFeasibilityScore + 8),
      startup_potential_score: Math.round((pipelineResult.innovationScore + marketOpportunityScore) / 2),
    },
    future_impact: {
      market_potential: marketPotential,
      adoption_probability: adoptionProbability,
      social_impact: Math.round(pipelineResult.innovationScore * 0.72),
      risk_level: riskLevel,
      timeline: (pipelineResult.ideaEvolution ?? []).map((stage) => ({
        year: stage.year,
        milestone: stage.stage,
        summary: stage.summary,
      })),
      outlook: `${ideaName} can expand into a stronger platform category with clearer strategic differentiation over time.`,
    },
    competitor_intelligence: {
      competition_level: competitionScore >= 70 ? "high" : competitionScore >= 50 ? "medium" : "low",
      competitors: pipelineResult.githubRepos.map((item) => ({
        title: item.name,
        description: item.description,
        stars: item.stars,
        url: item.url,
      })),
      market_positioning: "Position around faster validation loops, stronger proprietary insight synthesis, and clearer workflow ROI.",
    },
    market_insights: {
      market_size_billion_usd: Number(Math.max(1.2, pipelineResult.innovationScore / 18).toFixed(1)),
      growth_forecast_cagr: Number(Math.max(8, pipelineResult.innovationScore / 5.5).toFixed(1)),
      best_countries_for_launch: inferLaunchCountries(pipelineResult.ideaAnalysis.industries),
      yearly_projection: [
        { year: 2025, projection: 1.8 },
        { year: 2030, projection: 3.4 },
        { year: 2035, projection: 5.7 },
        { year: 2040, projection: 8.9 },
      ],
      summary: `${marketPotential} with the strongest traction expected in AI-forward launch markets.`,
    },
    idea_evolution: (pipelineResult.ideaEvolution ?? []).map((stage, index) => ({
      version: `Version ${index + 1}`,
      timeframe: `${stage.year}`,
      focus: stage.summary,
      milestones: [stage.stage],
    })),
    impact_simulations: [
      { scenario: "US launch", score: 78 },
      { scenario: "India launch", score: 74 },
      { scenario: "EU launch", score: 69 },
    ],
    pitch: {
      problem: ideaDescription,
      solution: pipelineResult.improvements?.[0] ?? "Use AI intelligence and workflow automation to solve the problem faster.",
      market: marketPotential,
      technology: technologyStack.join(", "),
      business_model: "SaaS subscription with enterprise pilots",
      future_vision: `${ideaName} becomes the operating intelligence layer for the category.`,
    },
    recommended_stack: {
      frontend: "Next.js",
      backend: "FastAPI",
      ai_model: "Groq + Hugging Face",
      database: "PostgreSQL",
    },
    architecture: {
      nodes: [
        { id: "user", label: "User" },
        { id: "frontend", label: "Frontend" },
        { id: "backend", label: "Backend API" },
        { id: "ai", label: "AI Engines" },
        { id: "db", label: "Data Store" },
      ],
      edges: [
        { source: "user", target: "frontend" },
        { source: "frontend", target: "backend" },
        { source: "backend", target: "ai" },
        { source: "backend", target: "db" },
      ],
    },
    radar_metrics: {
      originality: Math.max(0, 100 - pipelineResult.similarityScore),
      feasibility: technologyFeasibilityScore,
      complexity: Math.min(100, 50 + technologyStack.length * 8),
      market_potential: marketOpportunityScore,
    },
    analyzed_for: "innovation_intelligence_suite",
    external_intelligence: pipelineResult,
  };
}

function inferLaunchCountries(industries: string[]) {
  const joined = industries.join(" ").toLowerCase();
  if (joined.includes("fintech")) {
    return ["United States", "Singapore", "United Kingdom"];
  }
  if (joined.includes("health")) {
    return ["United States", "Germany", "Switzerland"];
  }
  if (joined.includes("education")) {
    return ["India", "United States", "United Kingdom"];
  }
  return ["United States", "India", "Germany"];
}
