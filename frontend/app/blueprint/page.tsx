"use client";

import { PageShell } from "@/components/layout/page-shell";
import { StartupBlueprint } from "@/components/ideas/startup-blueprint";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

export default function BlueprintPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Blueprint" description="Your roadmap, tech stack, team plan, and startup blueprint."><AuthRequiredState title="Sign in to open Blueprint" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Blueprint" description="Your roadmap, tech stack, team plan, and startup blueprint."><Card className="p-6">Preparing results...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Blueprint" description="Your roadmap, tech stack, team plan, and startup blueprint."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Blueprint" description="Your roadmap, tech stack, team plan, and startup blueprint."><EmptyIdeaState title="No blueprint available" description="Run an analysis first to unlock your blueprint." /></PageShell>;
  }

  return (
    <PageShell title="Blueprint" description="A founder-ready blueprint page with roadmap, product plan, team direction, and downloadable output.">
      <div className="grid gap-6 xl:grid-cols-2">
        <CollapsibleSection title="Roadmap Preview" description="High-level execution phases from the backend evolution model." defaultOpen>
          <ul className="list-disc space-y-2 pl-5">
            {analysis.idea_evolution.slice(0, 4).map((step, index) => (
              <li key={`${step.version ?? "phase"}-${index}`}>
                {String(step.version ?? `Phase ${index + 1}`)}: {String(step.focus ?? step.timeframe ?? "Execution stage")}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="Recommended Stack" description="Implementation guidance from the current backend report.">
          <ul className="list-disc space-y-2 pl-5">
            {Object.entries(analysis.recommended_stack).map(([key, value]) => (
              <li key={key}>
                {key.replace(/_/g, " ")}: {value}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>

      <StartupBlueprint analysis={analysis} />
    </PageShell>
  );
}
