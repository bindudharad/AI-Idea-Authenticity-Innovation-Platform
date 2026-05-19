"use client";

import { PageShell } from "@/components/layout/page-shell";
import { IdeaTreePanel } from "@/components/ideas/idea-tree-panel";
import { TechnologyKnowledgePanel } from "@/components/ideas/technology-knowledge-panel";
import { IdeaLoader } from "@/components/shared/idea-loader";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

export default function AnalysisPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Analysis" description="Understand the core structure of your idea."><AuthRequiredState title="Sign in to open Analysis" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Analysis" description="Understand the core structure of your idea."><IdeaLoader title="Opening analysis workspace..." description="Reusing your saved AI report and loading idea intelligence." /></PageShell>;
  }
  if (error) {
    return <PageShell title="Analysis" description="Understand the core structure of your idea."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Analysis" description="Understand the core structure of your idea."><EmptyIdeaState title="No idea analysis available" description="Run an analysis first to unlock this page." /></PageShell>;
  }

  return (
    <PageShell title="Analysis" description="A focused view of the idea itself: the problem, solution context, users, technology, and key guidance.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="panel-hover"><p className="panel-heading">Innovation Score</p><p className="mt-4 text-2xl font-semibold text-white">{Math.round(analysis.innovation_score)}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Similarity</p><p className="mt-4 text-2xl font-semibold text-white">{Math.round(analysis.similarity_score)}%</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Category</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.idea_profile.innovation_category}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CollapsibleSection title="Problem" description="What the system believes this idea is solving." defaultOpen>
          <ul className="list-disc space-y-2 pl-5">
            <li>{analysis.idea_profile.problem_statement}</li>
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="Solution Direction" description="Suggested execution framing from the backend guidance." defaultOpen>
          <ul className="list-disc space-y-2 pl-5">
            {analysis.suggestions.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CollapsibleSection title="Target Users" description="Primary user groups extracted from the idea.">
          <ul className="list-disc space-y-2 pl-5">
            {analysis.idea_profile.target_users.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </CollapsibleSection>
        <CollapsibleSection title="Technology Stack" description="Backend-recommended technology themes and stack cues.">
          <ul className="list-disc space-y-2 pl-5">
            {analysis.idea_profile.technology_stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IdeaTreePanel analysis={analysis} />
        <TechnologyKnowledgePanel analysis={analysis} />
      </div>

      <CollapsibleSection title="Risks" description="Potential blockers identified by the analysis engine.">
        <ul className="list-disc space-y-2 pl-5">
          {analysis.idea_profile.possible_risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </CollapsibleSection>
    </PageShell>
  );
}
