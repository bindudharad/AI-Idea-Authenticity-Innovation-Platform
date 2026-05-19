"use client";

import { PageShell } from "@/components/layout/page-shell";
import { OwnershipTimeline } from "@/components/ideas/ownership-timeline";
import { TeamWorkspace } from "@/components/ideas/team-workspace";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

export default function TeamPage() {
  const { idea, analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Team" description="Workspace, notes, and version history for the selected idea."><AuthRequiredState title="Sign in to open Team" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Team" description="Workspace, notes, and version history for the selected idea."><Card className="p-6">Loading team workspace...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Team" description="Workspace, notes, and version history for the selected idea."><ErrorState message={error} /></PageShell>;
  }
  if (!idea) {
    return <PageShell title="Team" description="Workspace, notes, and version history for the selected idea."><EmptyIdeaState title="No saved idea selected" description="Analyze and save an idea first to unlock team pages." /></PageShell>;
  }

  return (
    <PageShell title="Team" description="A focused team page for collaboration, ownership history, and execution context.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="panel-hover"><p className="panel-heading">Workspace</p><p className="mt-4 text-2xl font-semibold text-white">{idea.title}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Versions</p><p className="mt-4 text-2xl font-semibold text-white">{idea.versions.length}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Mode</p><p className="mt-4 text-2xl font-semibold text-white">{idea.mode}</p></Card>
      </div>

      {analysis ? (
        <CollapsibleSection title="Execution Notes" description="A short team-facing summary before opening detailed notes." defaultOpen>
          <ul className="list-disc space-y-2 pl-5">
            {analysis.suggestions.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      <TeamWorkspace idea={idea} />

      <OwnershipTimeline versions={idea.versions} ideaTitle={idea.title} />
    </PageShell>
  );
}
