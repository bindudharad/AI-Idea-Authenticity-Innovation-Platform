"use client";

import { EmptyAnalysisState } from "@/components/insights/empty-analysis-state";
import { FutureImpactCard } from "@/components/insights/future-impact-card";
import { ImpactSimulationCard } from "@/components/insights/impact-simulation-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";

export function ImpactSimulationClient() {
  const analysis = useLatestAnalysis();

  if (!analysis) {
    return <EmptyAnalysisState title="Run an analysis to simulate launch conditions" />;
  }

  return (
    <div className="space-y-6">
      <ImpactSimulationCard analysis={analysis} />
      <FutureImpactCard analysis={analysis} />
    </div>
  );
}
