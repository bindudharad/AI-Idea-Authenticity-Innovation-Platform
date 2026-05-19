import { AnalyzeIdeaResponse } from "@/types/api";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function ImpactSimulationCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Impact simulation engine</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Condition-based launch scenarios</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {analysis.impact_simulations.map((scenario, index) => (
          <div key={`${scenario.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-semibold text-white">{String(scenario.name)}</p>
              <Badge>{String(scenario.launch_country)}</Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Technology cost: {String(scenario.technology_cost)}</p>
              <p>Government support: {String(scenario.government_support)}</p>
              <p>Adoption probability: {Number(scenario.adoption_probability).toFixed(1)}%</p>
              <p>Market readiness: ${Number(scenario.market_readiness).toFixed(2)}B</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
