import { IdeaEvolutionClient } from "@/components/insights/idea-evolution-client";
import { PageShell } from "@/components/layout/page-shell";

export default function IdeaEvolutionPage() {
  return (
    <PageShell
      title="Idea Evolution"
      description="See how the platform expects the product to evolve across milestones, capabilities, and strategic maturity."
    >
      <IdeaEvolutionClient />
    </PageShell>
  );
}
