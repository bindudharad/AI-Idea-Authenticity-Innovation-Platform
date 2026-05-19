"use client";

import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { buildGlobalMarkers } from "@/lib/module-insights";
import { Card } from "@/ui/card";

const GlobalInnovationMap = dynamic(() => import("@/components/GlobalInnovationMap").then((mod) => mod.GlobalInnovationMap), { ssr: false });

export default function GlobalAnalysisPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Global Analysis" description="Launch-country and expansion signals from the backend market engine."><AuthRequiredState title="Sign in to open Global Analysis" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Global Analysis" description="Launch-country and expansion signals from the backend market engine."><Card className="p-6">Loading global analysis...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Global Analysis" description="Launch-country and expansion signals from the backend market engine."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Global Analysis" description="Launch-country and expansion signals from the backend market engine."><EmptyIdeaState title="No global market context available" description="Run an idea analysis to see launch countries, expansion cues, and global opportunity signals." /></PageShell>;
  }

  const markers = buildGlobalMarkers(analysis);

  return (
    <PageShell title="Global Analysis" description="Launch-country and expansion signals from the backend market engine.">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {analysis.market_insights.best_countries_for_launch.map((country) => (
          <Card key={country} className="panel-hover">
            <p className="panel-heading">Best country</p>
            <p className="mt-4 text-2xl font-semibold text-white">{country}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="panel-hover">
          <p className="panel-heading">Market gaps</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {analysis.suggestions.slice(0, 4).map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">{item}</div>
            ))}
          </div>
        </Card>
        <Card className="panel-hover">
          <p className="panel-heading">Expansion plan</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {analysis.idea_evolution.slice(0, 4).map((step, index) => (
              <div key={`${step.version ?? "phase"}-${index}`} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="font-semibold text-white">{String(step.version ?? `Phase ${index + 1}`)}</p>
                <p>{String(step.focus ?? step.timeframe ?? "Expansion stage")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="panel-hover">
        <p className="panel-heading">Global innovation map</p>
        <h2 className="panel-subtitle">Geographic innovation intensity</h2>
        <div className="mt-6">
          <GlobalInnovationMap markers={markers} />
        </div>
      </Card>
    </PageShell>
  );
}
