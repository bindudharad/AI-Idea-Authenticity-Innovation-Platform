"use client";

import { InnovationGaugeChart } from "@/charts/innovation-gauge-chart";

type InnovationScoreGaugeProps = {
  value: number;
};

export function InnovationScoreGauge({ value }: InnovationScoreGaugeProps) {
  return <InnovationGaugeChart value={value} />;
}
