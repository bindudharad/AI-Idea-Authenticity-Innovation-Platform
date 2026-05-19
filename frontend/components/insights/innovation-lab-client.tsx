"use client";

import { EmptyAnalysisState } from "@/components/insights/empty-analysis-state";
import { IdeaProfileCard } from "@/components/insights/idea-profile-card";
import { ResourceScanCard } from "@/components/insights/resource-scan-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";
import { InnovationScoreCard } from "@/components/ideas/innovation-score-card";
import { Card } from "@/ui/card";

export function InnovationLabClient() {
  const analysis = useLatestAnalysis();

  if (!analysis) {
    return <EmptyAnalysisState title="Run an analysis to unlock the innovation lab" />;
  }

  return (
    <div className="space-y-6">
      <IdeaProfileCard analysis={analysis} />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <InnovationScoreCard
          score={analysis.innovation_score}
          suggestions={analysis.suggestions}
          category={analysis.idea_profile.innovation_category}
        />
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Innovation score engine</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{analysis.innovation_score.toFixed(1)}/100</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(analysis.innovation_breakdown).map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label.replaceAll("_", " ")}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{Number(value).toFixed(1)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            {analysis.suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">
                {suggestion}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <ResourceScanCard analysis={analysis} />
    </div>
  );
}
