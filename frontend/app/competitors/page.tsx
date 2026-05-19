import { CompetitorsClient } from "@/components/insights/competitors-client";
import { PageShell } from "@/components/layout/page-shell";

export default function CompetitorsPage() {
  return (
    <PageShell
      title="Competitors"
      description="Investigate similar startups, competition density, technology maturity, and positioning hints for a sharper moat."
    >
      <CompetitorsClient />
    </PageShell>
  );
}
