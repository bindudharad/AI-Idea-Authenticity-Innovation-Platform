import { requestGroqJson } from "@/lib/groqClient";
import { InvestorDecisionResponse } from "@/types/api";

type Input = {
  ideaName: string;
  ideaDescription: string;
  ideaAnalysis?: {
    technologies?: string[];
    industries?: string[];
    problems?: string[];
  };
  similarityResults?: {
    similarityScore: number;
    closestMatches?: Array<{ source?: string }>;
  };
  marketData?: {
    market_size_billion_usd?: number;
    growth_forecast_cagr?: number;
    best_countries_for_launch?: string[];
    marketPotential?: string;
    adoptionProbability?: number;
    riskLevel?: string;
  };
  competitors?: Array<Record<string, string | number>>;
  innovationScore?: number;
};

export async function evaluateInvestmentPotential(
  ideaAnalysis: Input["ideaAnalysis"],
  similarityResults: Input["similarityResults"],
  marketData: Input["marketData"],
  competitors: Input["competitors"],
  ideaName = "Startup Idea",
  ideaDescription = "",
  innovationScoreInput = 60,
): Promise<InvestorDecisionResponse> {
  const marketOpportunityScore = clamp(
    35 +
      Number((marketData?.market_size_billion_usd ?? 1.5) * 4) +
      Number(marketData?.growth_forecast_cagr ?? 14) * 1.6,
  );
  const competitionScore = clamp(100 - Math.min(85, (competitors?.length ?? 0) * 8 + (similarityResults?.similarityScore ?? 0) * 0.2));
  const technologyFeasibilityScore = clamp(55 + (ideaAnalysis?.technologies?.length ?? 1) * 7);
  const riskScore = clamp(
    100 -
      ((marketData?.riskLevel === "Elevated" ? 72 : marketData?.riskLevel === "Moderate" ? 54 : 38) +
        (similarityResults?.similarityScore ?? 0) * 0.15),
  );
  const innovationScore = clamp(innovationScoreInput);

  const investorScore = clamp(
    innovationScore * 0.3 +
      marketOpportunityScore * 0.3 +
      technologyFeasibilityScore * 0.2 +
      competitionScore * 0.1 +
      riskScore * 0.1,
  );

  const fundingProbability = clamp(investorScore * 0.92);
  const riskLevel = fundingProbability >= 72 ? "Investor-ready" : fundingProbability >= 55 ? "Moderate diligence" : "High diligence";
  const marketPotential =
    marketOpportunityScore >= 75 ? "Strong VC-scale opportunity" : marketOpportunityScore >= 58 ? "Promising niche opportunity" : "Early or limited opportunity";

  const fallbackRecommendation = buildRecommendation({
    investorScore,
    competitionScore,
    technologyFeasibilityScore,
    marketPotential,
  });

  const aiRecommendation = await requestGroqJson<{ strategicAnalysis?: string[]; recommendation?: string }>(
    `Act as a venture capitalist.
Evaluate the investment potential of this startup idea.

Idea name: ${ideaName}
Idea description: ${ideaDescription}
Innovation score: ${innovationScore}
Similarity score: ${similarityResults?.similarityScore ?? 0}
Market opportunity score: ${marketOpportunityScore}
Competition score: ${competitionScore}
Technology feasibility score: ${technologyFeasibilityScore}
Risk score: ${riskScore}

Return strict JSON with keys:
- recommendation: short VC-style recommendation
- strategicAnalysis: array of 3 short investor insights`,
    {
      recommendation: fallbackRecommendation,
      strategicAnalysis: [
        "The market signal is strongest when the team frames a sharp launch wedge and a credible expansion path.",
        "Differentiation improves if the product captures proprietary workflow data that compounds over time.",
        "Investability rises when the technical roadmap proves near-term execution and measurable customer pull.",
      ],
    },
    "Return strict JSON only.",
  );

  return {
    investorScore,
    fundingProbability,
    riskLevel,
    marketPotential,
    recommendation: aiRecommendation.recommendation || fallbackRecommendation,
    marketOpportunityScore,
    competitionScore,
    technologyFeasibilityScore,
    riskScore,
    innovationScore,
    strategicAnalysis:
      Array.isArray(aiRecommendation.strategicAnalysis) && aiRecommendation.strategicAnalysis.length > 0
        ? aiRecommendation.strategicAnalysis.map((item) => String(item))
        : [
            "The opportunity is strongest when positioned around a repeatable go-to-market channel.",
            "Investors will want clearer signals around defensibility and execution velocity.",
            "Reducing overlap with comparable products materially improves funding odds.",
          ],
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function buildRecommendation(input: {
  investorScore: number;
  competitionScore: number;
  technologyFeasibilityScore: number;
  marketPotential: string;
}) {
  if (input.investorScore >= 75) {
    return `Strong investment case. ${input.marketPotential} with credible execution and defensibility signals.`;
  }
  if (input.investorScore >= 58) {
    return `Promising but needs sharper traction and moat proof before lead-investor conviction.`;
  }
  return `Early-stage opportunity. Strengthen differentiation, validation, and technical credibility before fundraising.`;
}
