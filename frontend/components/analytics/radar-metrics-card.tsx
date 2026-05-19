import { sampleAnalysis } from "@/services/mock-data";
import { Card } from "@/ui/card";
import { StartupPotentialRadar } from "@/charts/startup-potential-radar";

type RadarMetricsCardProps = {
  data?: { metric: string; value: number }[];
};

export function RadarMetricsCard({ data }: RadarMetricsCardProps) {
  const resolvedData = data ?? [
    { metric: "Originality", value: sampleAnalysis.originality },
    { metric: "Complexity", value: sampleAnalysis.complexity },
    { metric: "Market Potential", value: sampleAnalysis.marketPotential },
    { metric: "Feasibility", value: sampleAnalysis.feasibility }
  ];

  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Radar metrics</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Originality, complexity, market potential, and feasibility</h3>
      <StartupPotentialRadar data={resolvedData} />
    </Card>
  );
}
