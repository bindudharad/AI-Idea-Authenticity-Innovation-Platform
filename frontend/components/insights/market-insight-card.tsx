import { MarketOpportunityChart } from "@/charts/market-opportunity-chart";
import { AnalyzeIdeaResponse } from "@/types/api";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function MarketInsightCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const market = analysis.market_insights;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Market insights engine</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Launch-market opportunity</h2>
        </div>
        <Badge tone="success">{market.growth_forecast_cagr.toFixed(1)}% CAGR</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Market size</p>
          <p className="mt-3 text-3xl font-semibold text-white">${market.market_size_billion_usd.toFixed(1)}B</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Best countries</p>
          <p className="mt-3 text-lg font-semibold text-white">{market.best_countries_for_launch.join(", ")}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Summary</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{market.summary}</p>
        </div>
      </div>

      <div className="mt-6">
        <MarketOpportunityChart data={market.yearly_projection} />
      </div>
    </Card>
  );
}
