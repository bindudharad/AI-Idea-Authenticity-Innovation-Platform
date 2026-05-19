import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

export function EvolutionRoadmap({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Idea evolution engine</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Technology roadmap</h2>
      <div className="mt-6 space-y-4">
        {analysis.idea_evolution.map((step, index) => (
          <div key={`${step.version}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{String(step.version)}</p>
                <p className="mt-1 text-sm text-glow">{String(step.timeframe)}</p>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-300">{String(step.focus)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.isArray(step.capabilities)
                ? step.capabilities.map((capability) => (
                    <span
                      key={String(capability)}
                      className="rounded-full border border-white/10 bg-black/15 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-200"
                    >
                      {String(capability)}
                    </span>
                  ))
                : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
