"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { GraphContainer } from "@/components/dashboard/graph-container";
import { InsightPanel } from "@/components/dashboard/insight-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";
import { requestInvestorDecision } from "@/api/investorDecision";
import { InvestmentProbabilityGauge } from "@/charts/investment-probability-gauge";
import { InvestorMarketOpportunityChart } from "@/charts/investor-market-opportunity-chart";
import { InvestorRiskRadarChart } from "@/charts/investor-risk-radar-chart";
import { readLatestIdeaInput } from "@/services/latest-idea-input";
import { readLatestInvestorInsights, storeLatestInvestorInsights } from "@/services/latest-investor-insights";
import { InvestorDecisionResponse } from "@/types/api";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { BriefcaseBusiness, CircleDollarSign, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export default function InvestorInsightsPageView() {
  const analysis = useLatestAnalysis();
  const [insights, setInsights] = useState<InvestorDecisionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const stored = readLatestInvestorInsights();
    if (stored) {
      setInsights(stored);
      setLoading(false);
    }

    const latestInput = readLatestIdeaInput();
    if (!latestInput) {
      setLoading(false);
      return;
    }

    void requestInvestorDecision({
      ideaName: latestInput.ideaName,
      ideaDescription: latestInput.ideaDescription,
      ideaAnalysis: analysis?.external_intelligence?.ideaAnalysis,
      similarityResults: {
        similarityScore: analysis?.external_intelligence?.similarityScore ?? analysis?.similarity_score ?? 0,
        closestMatches: analysis?.external_intelligence?.closestMatches,
      },
      marketData: {
        market_size_billion_usd: analysis?.market_insights.market_size_billion_usd ?? 1.5,
        growth_forecast_cagr: analysis?.market_insights.growth_forecast_cagr ?? 12,
        best_countries_for_launch: analysis?.market_insights.best_countries_for_launch ?? [],
        marketPotential: analysis?.future_impact?.market_potential ?? "Promising niche opportunity",
        adoptionProbability: analysis?.future_impact?.adoption_probability ?? 50,
        riskLevel: analysis?.future_impact?.risk_level ?? "Moderate",
      },
      competitors: analysis?.competitor_intelligence.competitors,
      innovationScore: analysis?.innovation_score,
    })
      .then((result) => {
        if (!active) {
          return;
        }
        storeLatestInvestorInsights(result);
        setInsights(result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [analysis]);

  const marketOpportunityData = useMemo(
    () =>
      insights
        ? [
            { name: "Market", score: insights.marketOpportunityScore },
            { name: "Innovation", score: insights.innovationScore },
            { name: "Feasibility", score: insights.technologyFeasibilityScore },
            { name: "Competition", score: insights.competitionScore },
            { name: "Risk", score: insights.riskScore },
          ]
        : [],
    [insights],
  );

  const radarData = useMemo(
    () =>
      insights
        ? [
            { metric: "Opportunity", value: insights.marketOpportunityScore },
            { metric: "Innovation", value: insights.innovationScore },
            { metric: "Feasibility", value: insights.technologyFeasibilityScore },
            { metric: "Competition", value: insights.competitionScore },
            { metric: "Risk", value: insights.riskScore },
          ]
        : [],
    [insights],
  );

  if (!analysis && !insights && !loading) {
    return (
      <Card className="panel-hover">
        <p className="panel-heading">No analysis found</p>
        <h2 className="panel-subtitle">Run an idea analysis before opening Investor Insights</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The investor decision engine uses the latest product, market, and competition signals from your idea analysis.
        </p>
        <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Go to analysis
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
        <MetricCard label="Investor Score" value={`${Math.round(insights?.investorScore ?? 0)}`} animatedValue={Math.round(insights?.investorScore ?? 0)} detail="Composite investment signal across market, innovation, execution, and risk." icon={CircleDollarSign} accent="blue" />
        <MetricCard label="Funding Probability" value={`${Math.round(insights?.fundingProbability ?? 0)}%`} animatedValue={Math.round(insights?.fundingProbability ?? 0)} valueSuffix="%" detail="Estimated chance that the concept attracts investor interest." icon={TrendingUp} accent="violet" />
        <MetricCard label="Risk Level" value={insights?.riskLevel ?? "Moderate"} detail="VC diligence posture based on overlap, market risk, and execution confidence." icon={ShieldAlert} accent="coral" />
        <MetricCard label="Market Potential" value={insights?.marketPotential ?? "Emerging"} detail="How attractive the market opportunity looks to an investor lens." icon={BriefcaseBusiness} accent="emerald" />
        <MetricCard label="AI Recommendation" value={insights ? "Ready" : "--"} detail="Groq-generated strategic recommendation for improving investability." icon={Sparkles} accent="amber" />
      </div>

      {loading && !insights ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-6">
              <div className="skeleton-shimmer h-4 w-28 rounded-full" />
              <div className="mt-6 skeleton-shimmer h-10 w-24 rounded-2xl" />
              <div className="mt-6 skeleton-shimmer h-20 w-full rounded-[24px]" />
            </Card>
          ))}
        </div>
      ) : null}

      {insights ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <GraphContainer eyebrow="Investor lens" title="Investment Probability Gauge" copy="A fast read on how fundable the current concept appears.">
              <InvestmentProbabilityGauge value={insights.fundingProbability} />
            </GraphContainer>
            <GraphContainer eyebrow="Market dynamics" title="Market Opportunity Chart" copy="A breakdown of the major factors influencing investor conviction.">
              <InvestorMarketOpportunityChart data={marketOpportunityData} />
            </GraphContainer>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <GraphContainer eyebrow="Risk lens" title="Risk Radar Chart" copy="Interactive radar view across risk, competition, feasibility, and upside.">
              <InvestorRiskRadarChart data={radarData} />
            </GraphContainer>
            <Card className="panel-hover">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="panel-heading">VC recommendation</p>
                  <h2 className="panel-subtitle">AI Investor Decision</h2>
                </div>
                <Badge tone={insights.investorScore >= 70 ? "success" : insights.investorScore >= 55 ? "info" : "warning"}>
                  {insights.riskLevel}
                </Badge>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-200">{insights.recommendation}</p>
              <div className="mt-6 space-y-3">
                {insights.strategicAnalysis.map((item) => (
                  <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <InsightPanel title="Investor Insights" insights={insights.strategicAnalysis} />
        </>
      ) : null}
    </div>
  );
}
