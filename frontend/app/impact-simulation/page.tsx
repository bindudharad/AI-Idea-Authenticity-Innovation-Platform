import { PageShell } from "@/components/layout/page-shell";
import { ImpactSimulationClient } from "@/components/insights/impact-simulation-client";

export default function ImpactSimulationPage() {
  return (
    <PageShell
      title="Impact & Market Simulation"
      description="Simulate adoption velocity, carbon and social impact metrics, and long-term ecosystem ripple effects."
    >
      <ImpactSimulationClient />
    </PageShell>
  );
}
