import { requestGroqJson } from "@/lib/groqClient";
import { AnalyzeIdeaResponse, GeneratePitchResponse, PitchSlide } from "@/types/api";

type IdeaAnalysisSummary = {
  ideaName: string;
  description: string;
  problem: string;
  industry: string;
  targetUsers: string[];
  technologyStack: string[];
  innovationCategory: string;
  competitionLevel?: string;
  suggestedImprovements?: string[];
};

type MarketInsightSummary = {
  marketSizeBillionUsd: number;
  growthForecastCagr: number;
  bestCountriesForLaunch: string[];
  summary: string;
};

export async function generatePitchDeck(
  ideaAnalysis: IdeaAnalysisSummary,
  innovationScore: number,
  marketInsights: MarketInsightSummary,
): Promise<GeneratePitchResponse> {
  const fallbackSlides = buildFallbackSlides(ideaAnalysis, innovationScore, marketInsights);

  const result = await requestGroqJson<{ slides?: Array<Partial<PitchSlide>> }>(
    [
      "Generate a startup pitch deck for this idea.",
      "Include slides: Title, Problem, Solution, Market Opportunity, Technology, Business Model, Competitive Advantage, Future Vision.",
      "Return strict JSON with shape: {\"slides\":[{\"title\":\"...\",\"content\":\"...\"}]}",
      `Idea name: ${ideaAnalysis.ideaName}`,
      `Description: ${ideaAnalysis.description}`,
      `Problem: ${ideaAnalysis.problem}`,
      `Industry: ${ideaAnalysis.industry}`,
      `Target users: ${ideaAnalysis.targetUsers.join(", ") || "Founders and operators"}`,
      `Technology stack: ${ideaAnalysis.technologyStack.join(", ") || "AI platform stack"}`,
      `Innovation category: ${ideaAnalysis.innovationCategory}`,
      `Innovation score: ${innovationScore}`,
      `Competition level: ${ideaAnalysis.competitionLevel ?? "Moderate"}`,
      `Market size (USD billions): ${marketInsights.marketSizeBillionUsd}`,
      `Growth forecast CAGR: ${marketInsights.growthForecastCagr}%`,
      `Best launch countries: ${marketInsights.bestCountriesForLaunch.join(", ") || "United States"}`,
      `Market summary: ${marketInsights.summary}`,
      `Improvement suggestions: ${(ideaAnalysis.suggestedImprovements ?? []).join("; ") || "Differentiate on workflow automation and distribution."}`,
    ].join("\n"),
    { slides: fallbackSlides },
    "Return strict JSON only. Keep each slide concise, investor-ready, and grounded in the provided data.",
  );

  const normalizedSlides = normalizeSlides(result.slides, fallbackSlides);

  return {
    slides: normalizedSlides,
    generatedAt: new Date().toISOString(),
    provider: normalizedSlides === fallbackSlides ? "fallback" : "groq",
  };
}

export function buildPitchInputFromAnalysis(analysis: AnalyzeIdeaResponse): {
  ideaAnalysis: IdeaAnalysisSummary;
  innovationScore: number;
  marketInsights: MarketInsightSummary;
} {
  return {
    ideaAnalysis: {
      ideaName: analysis.idea_name,
      description: analysis.idea_profile.problem_statement,
      problem: analysis.idea_profile.problem_statement,
      industry: analysis.idea_profile.industry,
      targetUsers: analysis.idea_profile.target_users,
      technologyStack: analysis.idea_profile.technology_stack,
      innovationCategory: analysis.idea_profile.innovation_category,
      competitionLevel: analysis.competitor_intelligence.competition_level,
      suggestedImprovements: analysis.suggestions,
    },
    innovationScore: analysis.innovation_score,
    marketInsights: {
      marketSizeBillionUsd: analysis.market_insights.market_size_billion_usd,
      growthForecastCagr: analysis.market_insights.growth_forecast_cagr,
      bestCountriesForLaunch: analysis.market_insights.best_countries_for_launch,
      summary: analysis.market_insights.summary,
    },
  };
}

function normalizeSlides(slides: Array<Partial<PitchSlide>> | undefined, fallback: PitchSlide[]): PitchSlide[] {
  if (!Array.isArray(slides) || slides.length === 0) {
    return fallback;
  }

  const normalized = slides
    .map((slide, index) => {
      const title = String(slide.title ?? "").trim();
      const content = String(slide.content ?? "").trim();
      if (!title || !content) {
        return null;
      }
      return {
        id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "slide"}-${index + 1}`,
        title,
        content,
      };
    })
    .filter((slide): slide is PitchSlide => Boolean(slide));

  return normalized.length > 0 ? normalized : fallback;
}

function buildFallbackSlides(
  ideaAnalysis: IdeaAnalysisSummary,
  innovationScore: number,
  marketInsights: MarketInsightSummary,
): PitchSlide[] {
  return [
    {
      id: "title",
      title: "Title",
      content: `${ideaAnalysis.ideaName} is a ${ideaAnalysis.industry} concept designed for ${ideaAnalysis.targetUsers.join(", ") || "high-intent users"} with an innovation score of ${innovationScore}.`,
    },
    {
      id: "problem",
      title: "Problem",
      content: ideaAnalysis.problem,
    },
    {
      id: "solution",
      title: "Solution",
      content: `${ideaAnalysis.ideaName} uses ${ideaAnalysis.technologyStack.join(", ") || "AI-enabled workflows"} to solve the problem with a differentiated ${ideaAnalysis.innovationCategory.toLowerCase()} approach.`,
    },
    {
      id: "market-opportunity",
      title: "Market Opportunity",
      content: `The addressable market is estimated at $${marketInsights.marketSizeBillionUsd.toFixed(1)}B with ${marketInsights.growthForecastCagr.toFixed(1)}% CAGR. Best initial launch markets: ${marketInsights.bestCountriesForLaunch.join(", ")}.`,
    },
    {
      id: "technology",
      title: "Technology",
      content: `Core stack: ${ideaAnalysis.technologyStack.join(", ")}. The concept can be positioned as a practical AI product with measurable operating leverage and fast iteration cycles.`,
    },
    {
      id: "business-model",
      title: "Business Model",
      content: "Recommended model: SaaS subscription with team plans, enterprise pilots, and premium analytics or automation modules for expansion revenue.",
    },
    {
      id: "competitive-advantage",
      title: "Competitive Advantage",
      content: `Current competition level is ${ideaAnalysis.competitionLevel ?? "moderate"}. The moat improves by leaning into ${ideaAnalysis.suggestedImprovements?.[0] ?? "faster workflows, deeper analytics, and clearer product differentiation"}.`,
    },
    {
      id: "future-vision",
      title: "Future Vision",
      content: `${ideaAnalysis.ideaName} can evolve into an intelligence platform that becomes the operating layer for teams in ${ideaAnalysis.industry}, expanding from one use case into a broader ecosystem product.`,
    },
  ];
}
