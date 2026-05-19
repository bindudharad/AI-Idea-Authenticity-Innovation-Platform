import { AnalyzeIdeaResponse } from "@/types/api";
import { InnovationTimelineStage } from "@/components/InnovationTimelineSimulator";
import { GlobalInnovationMarker } from "@/components/GlobalInnovationMap";

export type PersonaInsight = {
  name: string;
  age: number;
  role: string;
  liked: string;
  confused: string;
  dropped: string;
  satisfaction: number;
};

export function buildDigitalTwinPersonas(analysis: AnalyzeIdeaResponse): PersonaInsight[] {
  const users = analysis.idea_profile.target_users;
  const industry = analysis.idea_profile.industry;
  const baseLikes = [
    `The product directly addresses ${analysis.idea_profile.problem_statement.toLowerCase()}.`,
    `The ${industry} focus feels specific instead of generic.`,
    `The suggested stack looks practical for a real launch.`,
    `The roadmap feels execution-oriented rather than just inspirational.`,
    `The market outlook gives confidence that the idea can scale.`,
  ];

  return [
    { name: "Aarav", age: 26, role: users[0] ?? "Early adopter" },
    { name: "Meera", age: 31, role: users[1] ?? "Operations lead" },
    { name: "Rohan", age: 35, role: users[2] ?? "Product manager" },
    { name: "Fatima", age: 29, role: users[0] ?? "Growth marketer" },
    { name: "Daniel", age: 40, role: users[1] ?? "Founder" },
  ].map((persona, index) => ({
    ...persona,
    liked: baseLikes[index] ?? baseLikes[0],
    confused: analysis.idea_profile.possible_risks[index % Math.max(1, analysis.idea_profile.possible_risks.length)] ?? "They wanted more clarity on onboarding and retention.",
    dropped:
      index % 2 === 0
        ? "Dropped during evaluation because pricing and implementation effort were still unclear."
        : "Dropped after initial interest because the differentiation versus incumbents was not obvious enough.",
    satisfaction: Math.max(58, Math.min(94, Math.round(analysis.innovation_score - analysis.similarity_score / 4 + 10 - index * 3))),
  }));
}

export function buildInvestorSummary(analysis: AnalyzeIdeaResponse) {
  const opportunityScore = Math.round(
    Math.max(
      45,
      Math.min(
        95,
        analysis.innovation_score * 0.45 +
          analysis.market_insights.growth_forecast_cagr * 1.2 +
          analysis.future_impact.adoption_probability * 0.35,
      ),
    ),
  );
  const riskScore = analysis.future_impact.risk_level.toLowerCase().includes("high")
    ? 74
    : analysis.future_impact.risk_level.toLowerCase().includes("low")
      ? 38
      : 56;
  const fundingProbability = Math.max(28, Math.min(91, Math.round(opportunityScore - riskScore * 0.28)));

  return {
    opportunityScore,
    riskScore,
    fundingProbability,
    decision: fundingProbability >= 62 ? "Invest" : "Watch",
    strengths: [
      `Strong fit for ${analysis.idea_profile.industry} pain points.`,
      `Launch countries already identified: ${analysis.market_insights.best_countries_for_launch.slice(0, 2).join(", ") || "global-first positioning"}.`,
      `Innovation score of ${Math.round(analysis.innovation_score)} creates a credible differentiation story.`,
    ],
    weaknesses: [
      `Similarity score of ${Math.round(analysis.similarity_score)} means the moat must be communicated clearly.`,
      `Risk posture is currently ${analysis.future_impact.risk_level.toLowerCase()}.`,
      `Execution complexity depends on ${analysis.idea_profile.technology_stack.slice(0, 2).join(" and ") || "a multi-system delivery stack"}.`,
    ],
  };
}

export function buildMentorPlan(analysis: AnalyzeIdeaResponse) {
  return {
    bestDecision: `Focus first on ${analysis.market_insights.best_countries_for_launch[0] ?? "the strongest demand market"} and launch a narrow version for ${analysis.idea_profile.target_users[0] ?? "your first target segment"}.`,
    alternatives: [
      "Run a low-code concierge MVP before building the full platform.",
      "Position the product as a workflow tool instead of a broad operating system for the first release.",
      "Use a services-led onboarding model to validate willingness to pay before automating everything.",
    ],
    actionSteps: [
      ...analysis.suggestions.slice(0, 3),
      `Use the first roadmap phase to validate ${analysis.idea_profile.problem_statement.toLowerCase()}.`,
      `Track market expansion around ${analysis.market_insights.best_countries_for_launch.slice(0, 2).join(" and ") || "your first launch markets"}.`,
    ],
  };
}

export function buildDnaProfile(analysis: AnalyzeIdeaResponse) {
  const riskScore = analysis.future_impact.risk_level.toLowerCase().includes("high")
    ? 78
    : analysis.future_impact.risk_level.toLowerCase().includes("low")
      ? 38
      : 56;
  const researchSignals = analysis.resource_scan.similar_research.length;
  const researchScore = Math.max(45, Math.min(95, 45 + researchSignals * 9));

  const genes = [
    {
      key: "technology",
      label: "Technology Gene",
      score: clamp(analysis.radar_metrics.technology_readiness ?? analysis.radar_metrics.complexity ?? 74),
      color: "#3b82f6",
      description: "Measures the sophistication of the technology stack powering the idea.",
    },
    {
      key: "market",
      label: "Market Gene",
      score: clamp(analysis.radar_metrics.market_potential ?? analysis.market_insights.growth_forecast_cagr * 4.2),
      color: "#22c55e",
      description: "Reflects market demand strength and launch readiness signals.",
    },
    {
      key: "innovation",
      label: "Innovation Gene",
      score: clamp(analysis.innovation_score),
      color: "#a855f7",
      description: "Captures originality compared with known products and references.",
    },
    {
      key: "research",
      label: "Research Gene",
      score: researchScore,
      color: "#22d3ee",
      description: "Indicates alignment with research and external knowledge signals.",
    },
    {
      key: "risk",
      label: "Risk Gene",
      score: clamp(riskScore),
      color: "#ef4444",
      description: "Represents execution and market risk pressure on the concept.",
    },
    {
      key: "impact",
      label: "Impact Gene",
      score: clamp(analysis.future_impact.social_impact ?? analysis.future_impact.adoption_probability ?? 70),
      color: "#f59e0b",
      description: "Summarizes projected economic or social impact potential.",
    },
  ];

  const summary = [
    { label: "Technology Strength", value: scoreLabel(genes[0].score) },
    { label: "Market Potential", value: scoreLabel(genes[1].score) },
    { label: "Innovation Level", value: scoreLabel(genes[2].score) },
    { label: "Research Alignment", value: scoreLabel(genes[3].score) },
    { label: "Risk Level", value: riskLabel(genes[4].score) },
    { label: "Impact Potential", value: scoreLabel(genes[5].score) },
  ];

  return { genes, summary };
}

export function buildTimelineStages(analysis: AnalyzeIdeaResponse): InnovationTimelineStage[] {
  const evolution = analysis.idea_evolution.slice(0, 4);
  const defaults: InnovationTimelineStage[] = [
    {
      year: 2025,
      title: "Prototype Development",
      summary: "Initial MVP development validates the startup concept with early adopters.",
      technology: "Core architecture stabilizes while automation and data layers mature.",
      market: "Pilot programs with early adopters validate demand signals.",
      impact: "Early results shape the product narrative and go-to-market focus.",
      challenges: "Proving feasibility and securing early user trust.",
    },
    {
      year: 2027,
      title: "Startup Adoption",
      summary: "The product starts scaling into a repeatable growth engine.",
      technology: "Infrastructure hardens for reliability and feature depth.",
      market: "Commercial adoption begins with targeted growth programs.",
      impact: "Initial market traction establishes credibility and momentum.",
      challenges: "Differentiation and execution speed versus incumbents.",
    },
    {
      year: 2030,
      title: "Platform Integration",
      summary: "The system integrates into larger enterprise or ecosystem workflows.",
      technology: "Advanced analytics and integrations expand capabilities.",
      market: "Adoption broadens through partnerships and integration layers.",
      impact: "Industry practices adapt around the solution's capabilities.",
      challenges: "Scaling operations, compliance, and support requirements.",
    },
    {
      year: 2034,
      title: "Global Impact",
      summary: "Widespread adoption positions the idea as a globally relevant platform.",
      technology: "Optimization, intelligence, and ecosystem effects compound.",
      market: "International expansion and cross-sector usage mature.",
      impact: "Long-term influence on industry standards and user behavior.",
      challenges: "Governance, ethics, and global regulatory alignment.",
    },
  ];

  return defaults.map((stage, index) => {
    const evolutionStep = evolution[index];
    if (!evolutionStep) {
      return stage;
    }
    return {
      ...stage,
      title: String(evolutionStep.version ?? stage.title),
      summary: String(evolutionStep.focus ?? stage.summary),
      technology: String(evolutionStep.technology ?? stage.technology),
      market: String(evolutionStep.market ?? stage.market),
      impact: String(evolutionStep.impact ?? stage.impact),
      challenges: String(evolutionStep.challenges ?? stage.challenges),
    };
  });
}

export function buildGlobalMarkers(analysis: AnalyzeIdeaResponse): GlobalInnovationMarker[] {
  const coordinates: Record<string, [number, number]> = {
    "United States": [-95.7129, 37.0902],
    India: [78.9629, 20.5937],
    Germany: [10.4515, 51.1657],
    Singapore: [103.8198, 1.3521],
    Japan: [138.2529, 36.2048],
    "United Kingdom": [-3.436, 55.3781],
    Canada: [-106.3468, 56.1304],
    Australia: [133.7751, -25.2744],
  };

  const countries = analysis.market_insights.best_countries_for_launch.length
    ? analysis.market_insights.best_countries_for_launch
    : ["United States", "India", "Germany"];

  return countries.map((country, index) => ({
    country,
    innovationCount: Math.max(4, 11 - index * 2),
    coordinates: coordinates[country] ?? [0, 0],
    patents: Math.max(1, 6 - index),
    research: Math.max(1, 5 - index),
    startups: Math.max(1, 4 - index),
  }));
}

export function buildReasoningBullets(analysis: AnalyzeIdeaResponse) {
  return [
    `Innovation score is ${Math.round(analysis.innovation_score)}, indicating ${scoreLabel(analysis.innovation_score).toLowerCase()} differentiation.`,
    `Similarity score is ${Math.round(analysis.similarity_score)}%, so overlap with existing ideas is ${analysis.similarity_score >= 60 ? "meaningful" : "manageable"}.`,
    `Competition level is ${analysis.competitor_intelligence.competition_level.toLowerCase()} based on comparable projects and ecosystem density.`,
    `Market outlook points to ${analysis.market_insights.best_countries_for_launch[0] ?? "a strong launch market"} with ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR.`,
  ];
}

function scoreLabel(score: number) {
  if (score >= 80) return "Very High";
  if (score >= 65) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function riskLabel(score: number) {
  if (score >= 75) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
