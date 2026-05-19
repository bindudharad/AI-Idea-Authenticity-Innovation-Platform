"use client";

import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { buildDigitalTwinPersonas } from "@/lib/module-insights";
import { Card } from "@/ui/card";

export default function DigitalTwinPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Digital Twin" description="Simulate realistic user reactions from the canonical backend report."><AuthRequiredState title="Sign in to open Digital Twin" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Digital Twin" description="Simulate realistic user reactions from the canonical backend report."><Card className="p-6">Loading digital twin personas...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Digital Twin" description="Simulate realistic user reactions from the canonical backend report."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Digital Twin" description="Simulate realistic user reactions from the canonical backend report."><EmptyIdeaState title="No backend analysis available" description="Run an idea analysis to generate realistic digital-twin personas." /></PageShell>;
  }

  const personas = buildDigitalTwinPersonas(analysis);

  return (
    <PageShell title="Digital Twin" description="Simulate realistic user reactions from the canonical backend report.">
      <div className="grid gap-6 xl:grid-cols-2">
        {personas.map((persona) => (
          <Card key={`${persona.name}-${persona.role}`} className="panel-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="panel-heading">{persona.role}</p>
                <h2 className="panel-subtitle">{persona.name}, {persona.age}</h2>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
                Satisfaction {persona.satisfaction}%
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <div><span className="font-medium text-white">Liked:</span> {persona.liked}</div>
              <div><span className="font-medium text-white">Confused:</span> {persona.confused}</div>
              <div><span className="font-medium text-white">Dropped:</span> {persona.dropped}</div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
