"use client";

import { CompetitorGrid } from "@/components/insights/competitor-grid";
import { EmptyAnalysisState } from "@/components/insights/empty-analysis-state";
import { ResourceScanCard } from "@/components/insights/resource-scan-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";

export function CompetitorsClient() {
  const analysis = useLatestAnalysis();

  if (!analysis) {
    return <EmptyAnalysisState title="Run an analysis to see competitor intelligence" />;
  }

  return (
    <div className="space-y-6">
      <CompetitorGrid analysis={analysis} />
      <ResourceScanCard analysis={analysis} />
    </div>
  );
}
