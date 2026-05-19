"use client";

import {
  AnalyzeIdeaResponse,
  CertificateRecord,
  IdeaGraphResponse,
  InnovationMapResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
  GeneratePitchResponse,
} from "@/types/api";
import { extractIndustries, extractKeywords, extractTechnologies } from "@/utils/keywordExtractor";
import { PlatformMode } from "@/types/idea";
import { computeInnovationScoreV2 } from "@/engines/innovationScoreEngineV2";
import { buildInnovationMapData } from "@/engines/globalInnovationMapEngine";
import { storeLatestAnalysis } from "@/services/latest-analysis";
import { storeLatestIdeaGraph } from "@/services/latest-idea-graph";
import { storeLatestIdeaInput } from "@/services/latest-idea-input";
import { storeLatestInnovationMap } from "@/services/latest-innovation-map";
import { storeLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { storeLatestInvestorInsights } from "@/services/latest-investor-insights";
import { storeLatestPitchDeck } from "@/services/latest-pitch-deck";

const demoIdeas = [
  {
    name: "AI Climate Prediction System",
    description:
      "AI platform that predicts climate volatility and provides resilience playbooks for cities and energy providers.",
  },
  {
    name: "Smart Agriculture Drone Network",
    description:
      "Autonomous drones that monitor crop health, optimize irrigation, and detect anomalies in real time.",
  },
  {
    name: "AI Medical Diagnosis Assistant",
    description:
      "Multimodal AI assistant that triages patient symptoms and supports clinician decision-making.",
  },
  {
    name: "Autonomous Traffic Optimization",
    description:
      "City-scale traffic orchestration layer that coordinates signals, fleets, and emergency corridors.",
  },
];

export type DemoDataset = {
  analysis: AnalyzeIdeaResponse;
  novelty: NoveltyCheckResponse;
  investor: InvestorDecisionResponse;
  pitchDeck: GeneratePitchResponse;
  ideaGraph: IdeaGraphResponse;
  innovationMap: InnovationMapResponse;
  certificatePreview: CertificateRecord | null;
  ideaInput: { ideaName: string; ideaDescription: string; mode: PlatformMode };
};

export function generateDemoDataset(
  mode: PlatformMode = "hackathon",
  customIdea?: { name: string; description: string }
): DemoDataset {
  const idea = customIdea || demoIdeas[Math.floor(Math.random() * demoIdeas.length)];
  
  // Dynamic similarity score based on text length and some random variance
  const baseSimilarity = Math.max(10, Math.min(45, 60 - (idea.description.length / 15)));
  const similarityScore = baseSimilarity + Math.floor(Math.random() * 8);

  // Dynamic innovation score based on keywords and length
  const hasAI = idea.description.toLowerCase().includes("ai") || idea.description.toLowerCase().includes("intelligence");
  const hasPlatform = idea.description.toLowerCase().includes("platform") || idea.description.toLowerCase().includes("system");
  const hasAutomation = idea.description.toLowerCase().includes("automation") || idea.description.toLowerCase().includes("optimize");
  
  const keywordBonus = (hasAI ? 15 : 0) + (hasPlatform ? 8 : 0) + (hasAutomation ? 12 : 0);
  const lengthScore = Math.min(25, idea.description.length / 25);
  const randomness = 35 + Math.random() * 25;
  
  let innovationScore = Math.min(98, Math.round(keywordBonus + lengthScore + randomness));

  const industries = extractIndustries(idea.description);
  const technologies = extractTechnologies(idea.description);
  const keywords = extractKeywords(idea.description);

  // Diverse AI-driven weighted scoring formula
  // finalScore = (originality * 0.30) + (marketPotential * 0.25) + (feasibility * 0.20) + (impact * 0.25)
  const originality = Math.min(100, 45 + (keywords.length * 4) + (Math.random() * 25));
  const marketPotential = Math.min(100, 40 + (industries.length * 12) + (Math.random() * 20));
  const feasibility = Math.min(100, 50 + (technologies.length * 6) + (Math.random() * 15));
  const impact = Math.min(100, 35 + (keywords.length * 5) + (Math.random() * 30));

  const weightedInnovationScore = Math.round(
    (originality * 0.30) + 
    (marketPotential * 0.25) + 
    (feasibility * 0.20) + 
    (impact * 0.25)
  );

  innovationScore = Math.max(40, Math.min(98, weightedInnovationScore));

  const analysis: AnalyzeIdeaResponse = {
    idea_name: idea.name,
    mode,
    similarity_score: similarityScore,
    innovation_score: innovationScore,
    copy_claim_warning: innovationScore > 85 ? "No critical overlaps detected." : "Moderate market overlap detected.",
    top_similar_projects: [
      {
        title: `${keywords[0] || industries[0] || "Global"} ${keywords[1] || "Innovation"} System`,
        description: `Autonomous ${keywords[0]?.toLowerCase() || "intelligence"} engine for ${industries[0]?.toLowerCase() || "enterprise"} scalability.`,
        source: "Venture Capital DB",
        mode,
        similarity_score: Math.min(95, similarityScore + 5),
      },
      {
        title: `${technologies[0] || "Smart"} ${keywords[2] || "Platform"}`,
        description: `Predictive ${keywords[1]?.toLowerCase() || "analytics"} using ${technologies[0] || "AI"} for high-impact ${industries[0]?.toLowerCase() || "sectors"}.`,
        source: "TechCrunch",
        mode,
        similarity_score: similarityScore,
      },
      {
        title: `NexGen ${industries[0] || "Innovation"} Lab`,
        description: `Decentralized ${keywords[2]?.toLowerCase() || "framework"} focusing on ${technologies[1] || "distributed systems"}.`,
        source: "GitHub Open Source",
        mode,
        similarity_score: Math.max(10, similarityScore - 8),
      },
    ],
    idea_profile: {
      industry: industries[0] || "AI Infrastructure",
      technology_stack: technologies.length > 0 ? technologies : ["Machine Learning", "Knowledge Graphs", "NLP", "IoT"],
      target_users: ["Startup teams", "Innovation labs", "Industry operators"],
      problem_statement: idea.description,
      possible_risks: ["Data availability constraints", "Integration complexity", "Regulatory requirements"],
      innovation_category: innovationScore > 80 ? "Breakthrough Systems" : "Incremental Innovation",
    },
    resource_scan: {
      similar_patents: [
        { title: `Adaptive ${keywords[0] || "Innovation"} Forecasting`, source: "USPTO", relevance: 82, applicant: "EcoLabs" },
      ],
      similar_research: [
        { title: `Global ${keywords[1] || "Intelligence"} Networks`, source: "arXiv", relevance: 76 },
      ],
      similar_startups: [
        { title: `${keywords[2] || "Future"}Grid AI`, source: "Startup", relevance: 68 },
      ],
      related_technologies: technologies.map(tech => ({ name: `${tech} Models`, fit: 80 + Math.random() * 15 })),
    },
    innovation_breakdown: {
      originality: Math.round(originality),
      technology: Math.round(feasibility),
      market_potential: Math.round(marketPotential),
      research_alignment: 80,
      competition: Math.max(0, 100 - similarityScore),
      impact: Math.round(impact),
    },
    suggestions: [
      `Integrate real-time ${technologies[0] || "AI"} research APIs for deeper analysis.`,
      `Launch with a high-urgency vertical such as ${industries[0] || "enterprise resilience"}.`,
      "Build a self-serve innovation dashboard for teams.",
    ],
    judging_scores: {
      innovation: innovationScore / 10,
      feasibility: 7.5 + Math.random() * 1.5,
      impact: Math.min(10, (innovationScore + 5) / 10),
    },
    startup_analysis: {
      market_demand: Math.min(100, 75 + industries.length * 8),
      competition_level: similarityScore > 35 ? "High" : similarityScore > 20 ? "Moderate" : "Low",
      scalability: "High",
      startup_potential_score: Math.round((innovationScore + (100 - similarityScore)) / 2),
    },
    future_impact: {
      market_potential: innovationScore > 75 ? "High" : "Moderate",
      adoption_probability: Math.min(100, 60 + Math.random() * 30),
      social_impact: Math.min(100, 70 + Math.random() * 25),
      risk_level: similarityScore > 40 ? "High" : "Low",
      timeline: [
        { year: 2025, milestone: "Prototype Development" },
        { year: 2030, milestone: "Startup Adoption" },
        { year: 2035, milestone: "Enterprise Integration" },
        { year: 2040, milestone: "Global Innovation Impact" },
      ],
      outlook: "This concept scales globally if execution remains disciplined and data pipelines are resilient.",
    },
    competitor_intelligence: {
      competition_level: similarityScore > 30 ? "High" : "Moderate",
      competitors: [
        { name: `${keywords[0] || "Insight"}Grid`, source: "Startup", similarity_score: similarityScore, technology_maturity: "Growth" },
        { name: `Geo${keywords[1] || "Future"} AI`, source: "Research", similarity_score: Math.max(0, similarityScore - 5), technology_maturity: "Advanced" },
      ],
      market_positioning: `Differentiated through ${technologies[0] || "AI"} intelligence and embedded forecasting.`,
    },
    market_insights: {
      market_size_billion_usd: 10 + Math.random() * 50,
      growth_forecast_cagr: 10 + Math.random() * 15,
      best_countries_for_launch: ["United States", "Singapore", "Germany"],
      yearly_projection: [
        { year: 2026, market_size: 3.4 },
        { year: 2028, market_size: 4.6 },
        { year: 2030, market_size: 6.1 },
        { year: 2032, market_size: 8.3 },
      ],
      summary: `Strong demand among ${industries[0]?.toLowerCase() || "innovation"}, smart infrastructure, and enterprise resilience programs.`,
    },
    idea_evolution: [
      { version: "Prototype Development", timeframe: "2025", focus: "MVP buildout and early pilots." },
      { version: "Startup Adoption", timeframe: "2030", focus: "Scaled deployment with anchor partners." },
      { version: "Enterprise Integration", timeframe: "2035", focus: "Cross-industry automation and data sharing." },
      { version: "Global Innovation Impact", timeframe: "2040", focus: "Worldwide adoption and policy influence." },
    ],
    impact_simulations: [
      { scenario: "Low cost", innovation_score: innovationScore + 2, investor_score: 85, market_potential: 88, risk: 42 },
    ],
    pitch: {
      Problem: idea.description.slice(0, 100) + "...",
      Solution: `AI-driven ${industries[0] || "innovation"} intelligence with actionable risk mitigation.`,
      Market: `Global ${industries[0] || "innovation"} resilience and infrastructure analytics.`,
    },
    recommended_stack: {
      Frontend: "Next.js",
      Backend: "FastAPI",
      AI: "Hugging Face + Groq",
      Database: "PostgreSQL",
    },
    architecture: {
      nodes: [{ id: "User" }, { id: "Frontend" }, { id: "AI Engine" }, { id: "Data Sources" }],
      edges: [{ from: "User", to: "Frontend" }, { from: "Frontend", to: "AI Engine" }],
    },
    radar_metrics: {
      originality: Math.round(originality),
      complexity: 78,
      market_potential: Math.round(marketPotential),
      feasibility: Math.round(feasibility),
      innovation: innovationScore,
      competition: similarityScore,
      risk: Math.max(0, 100 - feasibility),
      technologyReadiness: Math.round(feasibility),
    },
    analyzed_for: new Date().toISOString(),
    external_intelligence: {
      ideaName: idea.name,
      ideaAnalysis: {
        keywords: ["AI", "innovation intelligence", "climate analytics"],
        technologies: ["Artificial Intelligence", "Knowledge Graphs", "NLP"],
        industries: ["Climate Tech", "Smart Infrastructure"],
        targetUsers: ["Startups", "Innovation labs"],
        problems: ["Limited visibility into emerging innovation signals"],
        provider: "fallback",
      },
      patents: [],
      wikipedia: [],
      githubRepos: [],
      similarityScore: similarityScore,
      closestMatches: [],
      innovationScore: 92,
      improvements: [
        "Integrate real-time research APIs for deeper analysis.",
        "Launch with a high-urgency vertical such as climate resilience.",
      ],
      impactPrediction: {
        marketPotential: "High",
        adoptionProbability: 78,
        riskLevel: "Low",
      },
      investorDecision: undefined,
      novelty: undefined,
      pitchDeck: undefined,
      innovationMap: undefined,
      uniquenessScore: 92,
      matchingResources: [],
      dashboardSummary: {
        innovationScore: 92,
        similarityScore: similarityScore,
        noveltyScore: 91,
        investorScore: 88,
        marketPotential: "High",
      },
      radarMetrics: {
        innovation: 92,
        marketPotential: 88,
        technologyReadiness: 84,
        competition: 72,
        risk: 40,
      },
      ideaGraph: {
        nodes: [
          { id: "Idea", type: "idea", label: idea.name, description: idea.description },
          { id: "AI", type: "technology", label: "AI", description: "Core ML and reasoning models." },
          { id: "Climate", type: "industry", label: "Climate Tech", description: "Climate analytics industry." },
        ],
        edges: [{ source: "Idea", target: "AI", weight: 0.9, label: "core tech" }],
      },
      providers: {},
    },
  };

  const novelty: NoveltyCheckResponse = {
    noveltyScore: 91,
    noveltyLevel: "Breakthrough Innovation",
    relatedPatents: [],
    relatedTechnologies: ["Artificial Intelligence", "Knowledge Graphs", "NLP"],
    similarityScore: similarityScore,
    patentOverlap: 0.12,
    technologyOverlap: 0.18,
    competitionDensity: 0.4,
    patentOverlapPenalty: 0.8,
    technologyOverlapPenalty: 0.85,
    sourceFingerprint: `${analysis.idea_name}:${analysis.innovation_score}`,
  };

  const investor: InvestorDecisionResponse = {
    investorScore: 89,
    fundingProbability: 82,
    riskLevel: "Low",
    marketPotential: "High",
    recommendation: "Strong innovation edge with viable market appetite. Prepare for scale.",
    marketOpportunityScore: 86,
    competitionScore: 72,
    technologyFeasibilityScore: 84,
    riskScore: 40,
    innovationScore: 92,
    strategicAnalysis: [
      "Strong differentiation with AI-native workflow intelligence.",
      "Early focus on climate-tech or infrastructure partners.",
    ],
  };

  const pitchDeck: GeneratePitchResponse = {
    slides: [
      { id: "problem", title: "Problem", content: "Climate volatility creates costly, unpredictable disruption." },
      { id: "solution", title: "Solution", content: "AI-driven climate intelligence and response planning." },
      { id: "market", title: "Market Opportunity", content: "$38B+ climate resilience and infrastructure analytics." },
    ],
    generatedAt: new Date().toISOString(),
    provider: "fallback",
  };

  const ideaGraph: IdeaGraphResponse = {
    nodes: [
      { id: "Idea", label: idea.name, type: "idea", description: idea.description },
      { id: "NLP", label: "Natural Language Processing", type: "technology", description: "Language understanding." },
      { id: "Climate", label: "Climate Tech", type: "industry", description: "Climate analytics market." },
    ],
    edges: [
      { source: "Idea", target: "NLP", weight: 0.85, label: "insight extraction" },
      { source: "Idea", target: "Climate", weight: 0.8, label: "domain focus" },
    ],
    summary: {
      idea: idea.name,
      technology_count: 1,
      startup_count: 0,
      research_count: 0,
      industry_count: 1,
      product_count: 0,
    },
  };

  const innovationMap = buildInnovationMapData(analysis);

  const certificatePreview: CertificateRecord | null = null;

  return {
    analysis,
    novelty,
    investor,
    pitchDeck,
    ideaGraph,
    innovationMap,
    certificatePreview,
    ideaInput: {
      ideaName: idea.name,
      ideaDescription: idea.description,
      mode,
    },
  };
}

export function applyDemoDataset(dataset: DemoDataset) {
  const innovationScoreV2 = computeInnovationScoreV2(dataset.analysis, dataset.novelty, dataset.investor);
  const merged = {
    ...dataset.analysis,
    innovation_score: innovationScoreV2.score,
    innovation_breakdown: {
      originality: innovationScoreV2.breakdown.originality,
      technology: innovationScoreV2.breakdown.technology,
      market_potential: innovationScoreV2.breakdown.marketPotential,
      research_alignment: innovationScoreV2.breakdown.researchAlignment,
      competition: innovationScoreV2.breakdown.competition,
      impact: innovationScoreV2.breakdown.impact,
    },
  };

  storeLatestIdeaInput(dataset.ideaInput);
  storeLatestAnalysis(merged);
  storeLatestIdeaNovelty(dataset.novelty);
  storeLatestInvestorInsights(dataset.investor);
  storeLatestIdeaGraph(dataset.ideaGraph);
  storeLatestInnovationMap(dataset.innovationMap);
  storeLatestPitchDeck(dataset.pitchDeck);

  return merged;
}
