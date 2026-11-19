import { PageShell } from "@/components/layout/page-shell";
import { MarketInsightsClient } from "@/components/insights/market-insights-client";

export default function MarketInsightsPage() {
  return (
    <PageShell
      title="Market Dynamics & Forecasts"
      description="Predictive TAM/SAM estimation, CAGR forecasts, competitive saturation analysis, and growth catalysts."
    >
      <MarketInsightsClient />
    </PageShell>
  );
}
