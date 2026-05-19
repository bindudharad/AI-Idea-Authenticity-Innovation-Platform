"use client";

import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { buildMentorPlan } from "@/lib/module-insights";
import { Card } from "@/ui/card";

export default function MentorPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="AI Mentor" description="Founder guidance and action steps generated from backend analysis."><AuthRequiredState title="Sign in to open Mentor" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="AI Mentor" description="Founder guidance and action steps generated from backend analysis."><Card className="p-6">Loading mentor guidance...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="AI Mentor" description="Founder guidance and action steps generated from backend analysis."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="AI Mentor" description="Founder guidance and action steps generated from backend analysis."><EmptyIdeaState title="No mentor context available" description="Run an idea analysis to unlock AI mentor guidance for the selected workspace." /></PageShell>;
  }

  const mentor = buildMentorPlan(analysis);

  return (
    <PageShell title="AI Mentor" description="Founder guidance and action steps generated from backend analysis.">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="panel-hover xl:col-span-3">
          <p className="panel-heading">Best decision</p>
          <h2 className="panel-subtitle">{mentor.bestDecision}</h2>
        </Card>
        <Card className="panel-hover">
          <p className="panel-heading">Alternatives</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {mentor.alternatives.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">{item}</div>
            ))}
          </div>
        </Card>
        <Card className="panel-hover xl:col-span-2">
          <p className="panel-heading">Action steps</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mentor.actionSteps.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
