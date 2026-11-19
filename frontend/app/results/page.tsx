import { PageShell } from "@/components/layout/page-shell";
import { ResultsView } from "@/components/ideas/results-view";

export default function ResultsPage() {
  return (
    <PageShell
      title="Comprehensive Analysis Results"
      description="End-to-end evaluation report synthesizing novelty, market opportunity, technical architecture, and execution roadmap."
    >
      <ResultsView />
    </PageShell>
  );
}
