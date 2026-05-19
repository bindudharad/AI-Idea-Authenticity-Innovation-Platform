"use client";

import { EmptyAnalysisState } from "@/components/insights/empty-analysis-state";
import { FutureImpactCard } from "@/components/insights/future-impact-card";
import { MarketInsightCard } from "@/components/insights/market-insight-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";

export function MarketInsightsClient() {
  const analysis = useLatestAnalysis();

  if (!analysis) {
    return <EmptyAnalysisState title="Run an analysis to view market forecasts" />;
  }

  return (
    <div className="space-y-6">
      <MarketInsightCard analysis={analysis} />
      <FutureImpactCard analysis={analysis} />
    </div>
  );
}
