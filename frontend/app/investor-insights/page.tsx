import { PageShell } from "@/components/layout/page-shell";
import InvestorInsightsPageView from "@/pages/InvestorInsights";

export default function InvestorInsightsPage() {
  return (
    <PageShell
      title="Investor Decision Insights"
      description="AI venture simulation evaluating capital efficiency, market timing, defensibility, and return profile."
    >
      <InvestorInsightsPageView />
    </PageShell>
  );
}
