"use client";

import { PageShell } from "@/components/layout/page-shell";
import { IdeaLoader } from "@/components/shared/idea-loader";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { buildInvestorSummary } from "@/lib/module-insights";
import { Card } from "@/ui/card";

export default function InvestorPage() {
  const { analysis, loading, error, authRequired } = useActiveIdea();

  if (authRequired) {
    return <PageShell title="Investor" description="Investment-readiness signals derived from the backend analysis."><AuthRequiredState title="Sign in to open Investor" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Investor" description="Investment-readiness signals derived from the backend analysis."><IdeaLoader title="Opening funding intelligence..." description="Restoring investor signals, strengths, and risk context from your saved report." /></PageShell>;
  }
  if (error) {
    return <PageShell title="Investor" description="Investment-readiness signals derived from the backend analysis."><ErrorState message={error} /></PageShell>;
  }
  if (!analysis) {
    return <PageShell title="Investor" description="Investment-readiness signals derived from the backend analysis."><EmptyIdeaState title="No investor context available" description="Run an idea analysis to generate the backend metrics this page summarizes." /></PageShell>;
  }

  const investor = buildInvestorSummary(analysis);

  return (
    <PageShell title="Investor" description="Investment-readiness signals derived from the backend analysis.">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <Card className="panel-hover"><p className="panel-heading">Decision</p><p className="mt-4 text-2xl font-semibold text-white">{investor.decision}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Funding Probability</p><p className="mt-4 text-2xl font-semibold text-white">{investor.fundingProbability}%</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Opportunity Score</p><p className="mt-4 text-2xl font-semibold text-white">{investor.opportunityScore}</p></Card>
        <Card className="panel-hover"><p className="panel-heading">Risk Score</p><p className="mt-4 text-2xl font-semibold text-white">{investor.riskScore}</p></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="panel-hover">
          <p className="panel-heading">Strengths</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {investor.strengths.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">{item}</div>
            ))}
          </div>
        </Card>
        <Card className="panel-hover">
          <p className="panel-heading">Weaknesses</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {investor.weaknesses.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
