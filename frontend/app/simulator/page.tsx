"use client";

import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

const MarketGrowthChart = dynamic(() => import("@/charts/market-growth-chart").then((mod) => mod.MarketGrowthChart), { ssr: false });

export default function SimulatorPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Simulator" description="Review projected startup growth, impact, and execution risk."><AuthRequiredState title="Sign in to open Simulator" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Simulator" description="Review projected startup growth, impact, and execution risk."><Card className="p-6">Loading simulator...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Simulator" description="Review projected startup growth, impact, and execution risk."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Simulator" description="Review projected startup growth, impact, and execution risk."><EmptyIdeaState title="No simulator input available" description="Run an idea analysis first so the simulator has backend projections to work with." /></PageShell>;
  }

  const projections = analysis.market_insights.yearly_projection.map((item) => ({
    year: String(item.year ?? ""),
    projection: Number(item.projection ?? item.market_size ?? 0),
  }));

  return (
    <PageShell title="Simulator" description="Review projected startup growth, impact, and execution risk.">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <Card className="panel-hover"><p className="panel-heading">Market Size</p><p className="mt-4 text-2xl font-semibold text-white">${analysis.market_insights.market_size_billion_usd.toFixed(1)}B</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Growth Forecast</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Adoption Probability</p><p className="mt-4 text-2xl font-semibold text-white">{Math.round(analysis.future_impact.adoption_probability)}%</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Risk Level</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.future_impact.risk_level}</p></Card>
      </div>

      <Card className="panel-hover">
        <p className="panel-heading">Growth model</p>
        <h2 className="panel-subtitle">Yearly projection</h2>
        <div className="mt-6">
          <MarketGrowthChart data={projections} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="panel-hover">
          <p className="panel-heading">Impact simulations</p>
          <h2 className="panel-subtitle">Scenario outputs</h2>
          <div className="mt-6 space-y-3">
            {analysis.impact_simulations.map((simulation, index) => (
              <div key={`${simulation.scenario ?? "scenario"}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                <p className="font-semibold text-white">{String(simulation.scenario ?? `Scenario ${index + 1}`)}</p>
                <p>{String(simulation.outcome ?? simulation.result ?? "Projected outcome available in the backend simulation model.")}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="panel-hover">
          <p className="panel-heading">Execution outlook</p>
          <h2 className="panel-subtitle">Startup readiness</h2>
          <div className="mt-6 grid gap-4">
            {Object.entries(analysis.startup_analysis).map(([key, value]) => (
              <div key={key} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key.replace(/_/g, " ")}</p>
                <p className="mt-2 text-sm leading-7 text-white">{String(value)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
