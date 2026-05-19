"use client";

import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { SimilaritySimpleCard } from "@/components/ideas/similarity-simple-card";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { CollapsibleSection } from "@/components/shared/collapsible-section";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { Card } from "@/ui/card";

const SimilarityBarChart = dynamic(() => import("@/charts/similarity-bar-chart").then((mod) => mod.SimilarityBarChart), { ssr: false });

export default function SimilarPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Similar Ideas" description="See what overlaps with your idea and where the white space remains."><AuthRequiredState title="Sign in to open Similar Ideas" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Similar Ideas" description="See what overlaps with your idea and where the white space remains."><Card className="p-6">Preparing results...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Similar Ideas" description="See what overlaps with your idea and where the white space remains."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Similar Ideas" description="See what overlaps with your idea and where the white space remains."><EmptyIdeaState title="No similarity results available" description="Run an analysis first to unlock similar ideas." /></PageShell>;
  }

  const similarityData = analysis.top_similar_projects.map((item) => ({
    title: item.title,
    description: item.description,
    source: item.source,
    score: item.similarity_score,
  }));

  return (
    <PageShell title="Similar Ideas" description="A dedicated similarity page so founders can quickly assess overlap without digging through the full dashboard.">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <Card className="panel-hover"><p className="panel-heading">Similarity Score</p><p className="mt-4 text-2xl font-semibold text-white">{Math.round(analysis.similarity_score)}%</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Top Match</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.top_similar_projects[0]?.title ?? "None"}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">References</p><p className="mt-4 text-2xl font-semibold text-white">{analysis.top_similar_projects.length}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Warning</p><p className="mt-4 text-sm leading-7 text-white">{analysis.copy_claim_warning}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SimilaritySimpleCard analysis={analysis} />
        <Card className="panel-hover">
          <p className="panel-heading">Similarity chart</p>
          <h2 className="panel-subtitle">Closest known projects</h2>
          <div className="mt-6">
            <SimilarityBarChart data={similarityData} />
          </div>
        </Card>
      </div>

      <CollapsibleSection title="Detailed Matches" description="Open to inspect the strongest overlaps and their sources.">
        <ul className="list-disc space-y-3 pl-5">
          {analysis.top_similar_projects.map((item) => (
            <li key={`${item.source}-${item.title}`} className="text-slate-300">
              <span className="font-medium text-white">{item.title}</span> from {item.source} with {Math.round(item.similarity_score)}% similarity
            </li>
          ))}
        </ul>
      </CollapsibleSection>
    </PageShell>
  );
}
