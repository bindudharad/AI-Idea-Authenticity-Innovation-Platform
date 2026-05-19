import { ImpactTimelineChart } from "@/charts/impact-timeline-chart";
import { AnalyzeIdeaResponse } from "@/types/api";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function FutureImpactCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const impact = analysis.future_impact;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Future impact engine</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Long-range adoption outlook</h2>
        </div>
        <Badge tone={analysis.innovation_score >= 60 ? "success" : "warning"}>{impact.market_potential}</Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Adoption probability</p>
          <p className="mt-3 text-3xl font-semibold text-white">{impact.adoption_probability.toFixed(1)}%</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Social impact</p>
          <p className="mt-3 text-3xl font-semibold text-white">{impact.social_impact.toFixed(1)}%</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Risk level</p>
          <p className="mt-3 text-3xl font-semibold text-white">{impact.risk_level}</p>
        </div>
      </div>

      <div className="mt-6">
        <ImpactTimelineChart data={impact.timeline} />
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-300">{impact.outlook}</p>
    </Card>
  );
}
