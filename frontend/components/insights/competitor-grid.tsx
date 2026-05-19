import { AnalyzeIdeaResponse } from "@/types/api";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function CompetitorGrid({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const competitors = analysis.competitor_intelligence.competitors;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Competitor intelligence engine</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Competitive landscape</h2>
        </div>
        <Badge tone={analysis.similarity_score > 70 ? "warning" : "success"}>
          {analysis.competitor_intelligence.competition_level} competition
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {competitors.map((item, index) => (
          <div key={`${item.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{String(item.name)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{String(item.source)}</p>
              </div>
              <Badge>{String(item.technology_maturity)}</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Similarity</p>
                <p className="mt-2 text-xl font-semibold text-coral">{Number(item.similarity_score).toFixed(1)}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Competition level</p>
                <p className="mt-2 text-xl font-semibold text-white">{String(item.competition_level)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{String(item.differentiator_hint)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
