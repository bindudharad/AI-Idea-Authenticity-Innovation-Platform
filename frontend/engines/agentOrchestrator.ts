import { runGithubAgent } from "@/agents/githubAgent";
import { runIdeaAnalysisAgent } from "@/agents/ideaAnalysisAgent";
import { runIdeaGraphAgent } from "@/agents/ideaGraphAgent";
import { runIdeaImproverAgent } from "@/agents/ideaImproverAgent";
import { runImpactPredictionAgent } from "@/agents/impactPredictionAgent";
import { runInnovationAgent } from "@/agents/innovationAgent";
import { runKeywordAgent } from "@/agents/keywordAgent";
import { runPatentAgent } from "@/agents/patentAgent";
import { runResourceScannerAgent } from "@/agents/resourceScannerAgent";
import { runSimilarityAgent } from "@/agents/similarityAgent";
import { generateCertificate } from "@/engines/certificateEngine";
import { buildInnovationMapData } from "@/engines/globalInnovationMapEngine";
import { simulateIdeaEvolution } from "@/engines/ideaEvolutionEngine";
import { calculateIdeaNovelty } from "@/engines/noveltyEngine";
import { buildPitchInputFromAnalysis, generatePitchDeck } from "@/engines/pitchDeckEngine";
import { evaluateInvestmentPotential } from "@/engines/investorDecisionEngine";
import { scanResearchPapers } from "@/engines/researchPaperScanner";
import { AnalyzeIdeaResponse, IntegratedIdeaAnalysisResponse } from "@/types/api";

type AgentStatusMap = Record<string, "success" | "failed">;

type ResearchPaper = {
  title: string;
  author: string;
  year: string;
  url: string;
  relevanceScore: number;
};

export async function runAgentPipeline(input: {
  ideaName: string;
  ideaDescription: string;
  ideaType?: "startup" | "business";
}): Promise<IntegratedIdeaAnalysisResponse> {
  const status: AgentStatusMap = {};

  const ideaAnalysis = await runSafe("ideaAnalysisAgent", status, () =>
    runIdeaAnalysisAgent({ ideaText: input.ideaDescription }),
    {
      keywords: [],
      technologies: [],
      industries: [],
      domain: "Emerging innovation domain",
      innovationConcepts: [],
      targetUsers: [],
      problems: [],
      provider: "fallback" as const,
    },
  );

  const keywords = await runSafe(
    "keywordAgent",
    status,
    () => runKeywordAgent({ ideaText: input.ideaDescription, priorKeywords: ideaAnalysis.keywords }),
    ideaAnalysis.keywords,
  );

  const wikipedia = await runSafe(
    "resourceScannerAgent",
    status,
    () => runResourceScannerAgent({ keywords }),
    [],
  );

  const patents = await runSafe(
    "patentIntelligenceAgent",
    status,
    () => runPatentAgent({ keywords }),
    [],
  );

  const githubRepos = await runSafe(
    "technologyScannerAgent",
    status,
    () => runGithubAgent({ keywords }),
    [],
  );

  const researchPapers = await runSafe(
    "researchPaperAgent",
    status,
    () => scanResearchPapers(keywords),
    [],
  );

  const similarity = await runSafe(
    "similarityAgent",
    status,
    () =>
      runSimilarityAgent({
        ideaText: input.ideaDescription,
        wikipedia,
        patents,
        githubRepos,
      }),
    { similarityScore: 0, closestMatches: [] },
  );

  const innovation = await runSafe(
    "innovationScoringAgent",
    status,
    () =>
      runInnovationAgent({
        similarityScore: similarity.similarityScore,
        technologies: ideaAnalysis.technologies,
        competitionCount: patents.length + githubRepos.length,
      }),
    {
      innovationScore: 50,
      similarityScore: similarity.similarityScore,
      competitionLevel: "low",
      technologyNovelty: 1,
      competitionPenalty: 0,
    },
  );

  const improvements = await runSafe(
    "ideaImprovementAgent",
    status,
    () => runIdeaImproverAgent({ ideaText: input.ideaDescription }),
    [],
  );

  const impactPrediction = await runSafe(
    "impactPredictionAgent",
    status,
    () =>
      runImpactPredictionAgent({
        ideaText: input.ideaDescription,
        innovationScore: innovation.innovationScore,
        similarityScore: similarity.similarityScore,
      }),
    {
      marketPotential: "Medium",
      adoptionProbability: 50,
      riskLevel: "Moderate",
    },
  );

  const ideaGraph = await runSafe(
    "ideaGraphAgent",
    status,
    () =>
      runIdeaGraphAgent({
        ideaName: input.ideaName,
        technologies: ideaAnalysis.technologies,
        patents,
        githubRepos,
        wikipedia,
      }),
    { nodes: [], edges: [] },
  );

  const novelty = await runSafe(
    "noveltyEngine",
    status,
    async () =>
      calculateIdeaNovelty(
        ideaAnalysis,
        patents,
        githubRepos,
        wikipedia,
        similarity.similarityScore,
      ),
    {
      noveltyScore: Math.max(0, 100 - similarity.similarityScore),
      noveltyLevel: "Moderately Innovative" as const,
      relatedPatents: [],
      relatedTechnologies: [],
      similarityScore: similarity.similarityScore,
      patentOverlap: 0,
      technologyOverlap: 0,
      competitionDensity: 0,
      patentOverlapPenalty: 1,
      technologyOverlapPenalty: 1,
    },
  );

  const investorDecision = await runSafe(
    "investorDecisionEngine",
    status,
    async () =>
      evaluateInvestmentPotential(
        ideaAnalysis,
        similarity,
        {
          market_size_billion_usd: Math.max(1.2, Number((innovation.innovationScore / 18).toFixed(1))),
          growth_forecast_cagr: Math.max(8, Number((innovation.technologyNovelty * 14).toFixed(1))),
          best_countries_for_launch: inferLaunchCountries(ideaAnalysis.industries),
          marketPotential: impactPrediction.marketPotential,
          adoptionProbability: impactPrediction.adoptionProbability,
          riskLevel: impactPrediction.riskLevel,
        },
        githubRepos.map((repo) => ({
          name: repo.name,
          stars: repo.stars,
          description: repo.description,
        })),
        input.ideaName,
        input.ideaDescription,
        innovation.innovationScore,
      ),
    {
      investorScore: innovation.innovationScore,
      fundingProbability: Math.max(30, innovation.innovationScore - 8),
      riskLevel: impactPrediction.riskLevel,
      marketPotential: impactPrediction.marketPotential,
      recommendation: "Validate a sharper wedge and build stronger evidence of demand.",
      marketOpportunityScore: 60,
      competitionScore: 55,
      technologyFeasibilityScore: 65,
      riskScore: 48,
      innovationScore: innovation.innovationScore,
      strategicAnalysis: [],
    },
  );

  const dashboardSeed = buildDashboardSeed(
    input.ideaName,
    input.ideaDescription,
    ideaAnalysis,
    similarity.similarityScore,
    innovation.innovationScore,
    { researchPapers },
  );

  const pitchInput = buildPitchInputFromAnalysis(dashboardSeed);

  const pitchDeck = await runSafe(
    "pitchDeckEngine",
    status,
    async () =>
      generatePitchDeck(pitchInput.ideaAnalysis, pitchInput.innovationScore, pitchInput.marketInsights),
    {
      slides: [
        { id: "problem-1", title: "Problem", content: dashboardSeed.idea_profile.problem_statement },
        { id: "solution-1", title: "Solution", content: dashboardSeed.suggestions[0] ?? "Differentiate with a more focused AI workflow." },
      ],
      generatedAt: new Date().toISOString(),
      provider: "fallback" as const,
    },
  );
  const ideaEvolution = await runSafe(
    "ideaEvolutionEngine",
    status,
    async () =>
      simulateIdeaEvolution({
        ideaName: input.ideaName,
        industries: ideaAnalysis.industries,
        technologies: ideaAnalysis.technologies,
        innovationScore: innovation.innovationScore,
      }),
    [],
  );
  const assembledAnalysis = buildDashboardSeed(
    input.ideaName,
    input.ideaDescription,
    ideaAnalysis,
    similarity.similarityScore,
    innovation.innovationScore,
    {
      impactPrediction,
      investorDecision,
      improvements,
      ideaEvolution,
      researchPapers,
    },
  );

  const innovationMap = await runSafe(
    "innovationMapEngine",
    status,
    async () => buildInnovationMapData(assembledAnalysis),
    { data: [] },
  );

  const uniquenessScore = Math.max(0, 100 - similarity.similarityScore);
  const certificatePreview =
    uniquenessScore >= 90 ? generateCertificate(input.ideaName, uniquenessScore, "demo-user-001") : undefined;

  const radarMetrics = {
    innovation: innovation.innovationScore,
    marketPotential: investorDecision.marketOpportunityScore,
    technologyReadiness: investorDecision.technologyFeasibilityScore,
    competition: investorDecision.competitionScore,
    risk: 100 - investorDecision.riskScore,
  };

  return {
    ideaName: input.ideaName,
    idea_type: input.ideaType ?? "startup",
    ideaAnalysis,
    keywords,
    patents,
    wikipedia,
    githubRepos,
    researchPapers,
    similarityScore: similarity.similarityScore,
    closestMatches: similarity.closestMatches,
    innovationScore: innovation.innovationScore,
    competitionLevel: innovation.competitionLevel,
    technologyNovelty: innovation.technologyNovelty,
    competitionPenalty: innovation.competitionPenalty,
    improvements,
    impactPrediction,
    ideaEvolution,
    novelty,
    investorDecision,
    pitchDeck,
    innovationMap,
    uniquenessScore,
    matchingResources: similarity.closestMatches,
    radarMetrics,
    dashboardSummary: {
      innovationScore: innovation.innovationScore,
      similarityScore: similarity.similarityScore,
      noveltyScore: novelty.noveltyScore,
      investorScore: investorDecision.investorScore,
      marketPotential: investorDecision.marketPotential,
    },
    ideaGraph,
    certificatePreview,
    agentStatus: status,
    providers: {
      groq: ideaAnalysis.provider,
      embeddings: process.env.HF_API_KEY ? "huggingface" : "fallback",
    },
  };
}

async function runSafe<T>(
  agentName: string,
  status: AgentStatusMap,
  task: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const result = await task();
    status[agentName] = "success";
    return result;
  } catch {
    status[agentName] = "failed";
    return fallback;
  }
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

function buildDashboardSeed(
  ideaName: string,
  ideaDescription: string,
  ideaAnalysis: Awaited<ReturnType<typeof runIdeaAnalysisAgent>>,
  similarityScore: number,
  innovationScore: number,
  overrides?: {
    impactPrediction?: {
      marketPotential: string;
      adoptionProbability: number;
      riskLevel: string;
    };
    investorDecision?: {
      marketOpportunityScore: number;
      competitionScore: number;
      technologyFeasibilityScore: number;
      riskScore: number;
      marketPotential: string;
    };
    improvements?: string[];
    ideaEvolution?: Array<{ year: number; stage: string; summary: string }>;
    researchPapers?: ResearchPaper[];
  },
): AnalyzeIdeaResponse {
  const marketPotentialLabel = overrides?.impactPrediction?.marketPotential ?? "Medium market potential";
  const competitionScore = overrides?.investorDecision?.competitionScore ?? 58;
  const innovationCategory = ideaAnalysis.industries[0]
    ? `${ideaAnalysis.industries[0]} intelligence`
    : "Applied AI innovation";

  return {
    idea_name: ideaName,
    mode: "business",
    similarity_score: similarityScore,
    innovation_score: innovationScore,
    copy_claim_warning: similarityScore >= 70 ? "Similar project already exists." : "No direct copy claim detected.",
    top_similar_projects: [],
    idea_profile: {
      industry: ideaAnalysis.industries[0] ?? "AI software",
      technology_stack: ideaAnalysis.technologies,
      target_users: ideaAnalysis.targetUsers,
      problem_statement: ideaAnalysis.problems[0] ?? ideaDescription,
      possible_risks:
        similarityScore >= 60
          ? ["High overlap with existing solutions", "Need stronger differentiation"]
          : ["Execution speed risk"],
      innovation_category: innovationCategory,
    },
    resource_scan: {
      similar_patents: [],
      similar_research: overrides?.researchPapers ?? [],
      similar_startups: [],
      related_technologies: ideaAnalysis.technologies.map((item, index) => ({ name: item, fit: 92 - index * 7 })),
    },
    innovation_breakdown: {
      originality: Math.max(0, 100 - similarityScore),
      technology_novelty: Math.round((ideaAnalysis.technologies.length + 2) * 10),
      market_uniqueness: Math.round(Math.max(45, innovationScore - 8)),
    },
    suggestions: overrides?.improvements ?? [],
    judging_scores: {
      innovation: Math.round(innovationScore / 10),
      technical_complexity: Math.round((overrides?.investorDecision?.technologyFeasibilityScore ?? 65) / 10),
      real_world_impact: Math.round((overrides?.impactPrediction?.adoptionProbability ?? 60) / 10),
      overall: Number(
        ((innovationScore / 10 + (overrides?.impactPrediction?.adoptionProbability ?? 60) / 10) / 2).toFixed(1),
      ),
    },
    startup_analysis: {
      market_demand: Math.round(overrides?.investorDecision?.marketOpportunityScore ?? 62),
      competition_level: competitionScore,
      scalability: Math.round((overrides?.investorDecision?.technologyFeasibilityScore ?? 65) + 8),
      startup_potential_score: Math.round(
        (innovationScore + (overrides?.investorDecision?.marketOpportunityScore ?? 62)) / 2,
      ),
    },
    future_impact: {
      market_potential: marketPotentialLabel,
      adoption_probability: overrides?.impactPrediction?.adoptionProbability ?? 60,
      social_impact: Math.round(innovationScore * 0.72),
      risk_level: overrides?.impactPrediction?.riskLevel ?? "Moderate",
      timeline: (overrides?.ideaEvolution ?? []).map((stage) => ({
        year: stage.year,
        milestone: stage.stage,
        summary: stage.summary,
      })),
      outlook: `${ideaName} can expand into a larger intelligence platform with better differentiation over time.`,
    },
    competitor_intelligence: {
      competition_level: competitionScore >= 70 ? "high" : competitionScore >= 50 ? "medium" : "low",
      competitors: [],
      market_positioning: "Position around faster validation, stronger proprietary data, and clearer workflow ROI.",
    },
    market_insights: {
      market_size_billion_usd: Number(Math.max(1.2, innovationScore / 18).toFixed(1)),
      growth_forecast_cagr: Number(Math.max(8, innovationScore / 5.5).toFixed(1)),
      best_countries_for_launch: inferLaunchCountries(ideaAnalysis.industries),
      yearly_projection: [
        { year: 2025, projection: 1.8 },
        { year: 2030, projection: 3.4 },
        { year: 2035, projection: 5.7 },
        { year: 2040, projection: 8.9 },
      ],
      summary: `${marketPotentialLabel} with strongest traction expected in the most AI-forward launch markets.`,
    },
    idea_evolution: (overrides?.ideaEvolution ?? []).map((stage, index) => ({
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
      solution: overrides?.improvements?.[0] ?? "Use AI intelligence and workflow automation to solve the problem faster.",
      market: marketPotentialLabel,
      technology: ideaAnalysis.technologies.join(", "),
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
      originality: Math.max(0, 100 - similarityScore),
      feasibility: overrides?.investorDecision?.technologyFeasibilityScore ?? 65,
      complexity: Math.min(100, 50 + ideaAnalysis.technologies.length * 8),
      market_potential: overrides?.investorDecision?.marketOpportunityScore ?? 62,
    },
    analyzed_for: "innovation_intelligence_suite",
  };
}



