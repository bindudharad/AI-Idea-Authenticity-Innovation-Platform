import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ShieldAlert,
  Sparkles,
  Telescope,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";

type AnalyticsOverviewProps = {
  metrics?: {
    innovationScore: number;
    similarityScore: number;
    investorScore?: number;
    marketOpportunity: number;
    riskLevel: string;
    competitorCount: number;
    technologyReadiness: number;
  };
};

export function AnalyticsOverview({ metrics }: AnalyticsOverviewProps) {
  const resolved = metrics ?? {
    innovationScore: 76,
    similarityScore: 34,
    investorScore: 72,
    marketOpportunity: 82,
    riskLevel: "Moderate",
    competitorCount: 6,
    technologyReadiness: 71,
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      <MetricCard
        label="Innovation Score"
        value={`${resolved.innovationScore}`}
        animatedValue={resolved.innovationScore}
        detail="Composite originality signal blending similarity, novelty, and market whitespace."
        icon={Sparkles}
        accent="blue"
      />
      <MetricCard
        label="Similarity Score"
        value={`${resolved.similarityScore}%`}
        animatedValue={resolved.similarityScore}
        valueSuffix="%"
        detail="Closest overlap with known ideas, startups, and project references."
        icon={Activity}
        accent="violet"
      />
      <MetricCard
        label="Investor Score"
        value={`${resolved.investorScore ?? 0}`}
        animatedValue={resolved.investorScore ?? 0}
        detail="Investor readiness based on innovation, market, feasibility, competition, and risk."
        icon={Sparkles}
        accent="amber"
      />
      <MetricCard
        label="Market Opportunity"
        value={`${resolved.marketOpportunity}%`}
        animatedValue={resolved.marketOpportunity}
        valueSuffix="%"
        detail="Estimated demand strength based on opportunity timing and launch readiness."
        icon={BriefcaseBusiness}
        accent="emerald"
      />
      <MetricCard
        label="Risk Level"
        value={resolved.riskLevel}
        detail="Strategic risk posture across execution complexity, competition, and adoption."
        icon={ShieldAlert}
        accent="coral"
      />
      <MetricCard
        label="Competitor Count"
        value={`${resolved.competitorCount}`}
        animatedValue={resolved.competitorCount}
        detail="Tracked comparable startups and adjacent product signals in the ecosystem."
        icon={Telescope}
        accent="amber"
      />
      <MetricCard
        label="Technology Readiness"
        value={`${resolved.technologyReadiness}%`}
        animatedValue={resolved.technologyReadiness}
        valueSuffix="%"
        detail="How prepared the stack appears for shipping, scaling, and enterprise trust."
        icon={BarChart3}
        accent="blue"
      />
    </div>
  );
}
