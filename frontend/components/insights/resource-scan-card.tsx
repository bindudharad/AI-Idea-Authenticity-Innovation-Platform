import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

type ResourceGroupProps = {
  title: string;
  items: Array<Record<string, string | number>>;
};

function ResourceGroup({ title, items }: ResourceGroupProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
            <p className="font-medium text-white">{String(item.title ?? item.name ?? "Reference")}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{String(item.source ?? "Knowledge")}</p>
            {"description" in item ? <p className="mt-2 text-sm leading-6 text-slate-300">{String(item.description)}</p> : null}
            {"snippet" in item ? <p className="mt-2 text-sm leading-6 text-slate-300">{String(item.snippet)}</p> : null}
            {"applicant" in item ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Applicant {String(item.applicant)}</p> : null}
            {"patentNumber" in item ? <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">Patent {String(item.patentNumber)}</p> : null}
            {"relevance" in item ? <p className="mt-2 text-sm text-glow">Relevance {Number(item.relevance).toFixed(0)}%</p> : null}
            {"fit" in item ? <p className="mt-2 text-sm text-glow">Fit {Number(item.fit).toFixed(0)}%</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResourceScanCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Global resource scanner</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Patents, research, startups, and technologies</h2>
      {analysis.external_intelligence ? (
        <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
          External live scan active via {analysis.external_intelligence.providers?.groq ?? "fallback AI"}, Hugging Face,
          Wikipedia, GitHub, and USPTO integrations.
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ResourceGroup title="Similar patents" items={analysis.resource_scan.similar_patents} />
        <ResourceGroup title="Similar research" items={analysis.resource_scan.similar_research} />
        <ResourceGroup title="Similar startups" items={analysis.resource_scan.similar_startups} />
        <ResourceGroup title="Related technologies" items={analysis.resource_scan.related_technologies} />
      </div>
    </Card>
  );
}
