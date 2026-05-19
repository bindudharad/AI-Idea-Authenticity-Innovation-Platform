"use client";

import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { EvolutionRoadmap } from "@/components/insights/evolution-roadmap";
import { PitchGeneratorCard } from "@/components/insights/pitch-generator-card";
import { useActiveIdea } from "@/hooks/use-active-idea";

export function IdeaEvolutionClient() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <AuthRequiredState title="Sign in to open the evolution roadmap" />;
  }

  if (loading) {
    return <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">Loading evolution roadmap...</div>;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!analysis) {
    return <EmptyIdeaState title="Run an analysis to generate an evolution roadmap" description="The evolution engine uses your saved backend idea analysis to build roadmap stages and founder pitch output." />;
  }

  return (
    <div className="space-y-6">
      <EvolutionRoadmap analysis={analysis} />
      <PitchGeneratorCard analysis={analysis} />
    </div>
  );
}
