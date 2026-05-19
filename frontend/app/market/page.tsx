"use client";

import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { IdeaLoader } from "@/components/shared/idea-loader";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

const CompetitorComparisonChart = dynamic(() => import("@/charts/competitor-comparison-chart").then((mod) => mod.CompetitorComparisonChart), { ssr: false });
const MarketGrowthChart = dynamic(() => import("@/charts/market-growth-chart").then((mod) => mod.MarketGrowthChart), { ssr: false });
const LocationProfitIntelligence = dynamic(
  () => import("@/components/market/location-profit-intelligence").then((mod) => mod.LocationProfitIntelligence),
  { ssr: false },
);

export default function MarketPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Market" description="Check demand, competition, and launch opportunity."><AuthRequiredState title="Sign in to open Market" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Market" description="Check demand, competition, and launch opportunity."><IdeaLoader title="Opening market intelligence..." description="Using your saved analysis to restore growth, competition, and demand signals." /></PageShell>;
  }
  if (error) {
    return <PageShell title="Market" description="Check demand, competition, and launch opportunity."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Market" description="Check demand, competition, and launch opportunity."><EmptyIdeaState title="No market analysis available" description="Run an analysis first to unlock this page." /></PageShell>;
  }

  const growthData = analysis.market_insights.yearly_projection.map((item) => ({
    year: String(item.year ?? ""),
    projection: Number(item.projection ?? item.market_size ?? 0),
  }));

  const competitorData = analysis.competitor_intelligence.competitors.slice(0, 5).map((item) => ({
    name: String(item.name ?? "Comparable startup"),
    maturity: Number(item.technology_maturity ?? 60),
    traction: Number(item.similarity_score ?? 55),
  }));

  return (
    <PageShell title="Market" description="A clean market page focused on opportunity, competition, launch countries, and projected growth.">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <Card className="panel-hover"><p className="panel-heading">Market Size</p><p className="mt-4 text-2xl font-semibold text-white">${analysis.market_insights.market_size_billion_usd.toFixed(1)}B</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Growth Forecast</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Competition</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.competitor_intelligence.competition_level}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Best Launch</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.market_insights.best_countries_for_launch[0] ?? "TBD"}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="panel-hover">
          <p className="panel-heading">Growth</p>
          <h2 className="panel-subtitle">Projected market curve</h2>
          <div className="mt-6">
            <MarketGrowthChart data={growthData} />
          </div>
        </Card>
        <Card className="panel-hover">
          <p className="panel-heading">Competition</p>
          <h2 className="panel-subtitle">Comparable market players</h2>
          <div className="mt-6">
            <CompetitorComparisonChart data={competitorData} />
          </div>
        </Card>
      </div>

      <LocationProfitIntelligence />

      <div className="grid gap-6 xl:grid-cols-2">
        <CollapsibleSection title="Market Summary" description="Short overview from the backend market engine." defaultOpen>
          <ul className="list-disc space-y-2 pl-5">
            <li>{analysis.market_insights.summary}</li>
            <li>Market positioning: {analysis.competitor_intelligence.market_positioning}</li>
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="Launch Countries" description="Suggested countries to prioritize first.">
          <ul className="list-disc space-y-2 pl-5">
            {analysis.market_insights.best_countries_for_launch.map((country) => (
              <li key={country}>{country}</li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    </PageShell>
  );
}
