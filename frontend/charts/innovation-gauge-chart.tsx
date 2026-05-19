"use client";

import GaugeChart from "react-gauge-chart";

type InnovationGaugeChartProps = {
  value: number;
};

export function InnovationGaugeChart({ value }: InnovationGaugeChartProps) {
  return (
    <div className="h-[280px] w-full">
      <GaugeChart
        id="innovation-gauge"
        nrOfLevels={24}
        percent={Math.max(0, Math.min(1, value / 100))}
        colors={["#ff7b72", "#d3b068", "#64f1d6"]}
        arcWidth={0.22}
        needleColor="#d9e6ff"
        needleBaseColor="#d9e6ff"
        textColor="#ffffff"
        formatTextValue={() => `${Math.round(value)}`}
      />
      <p className="-mt-2 text-center text-sm uppercase tracking-[0.18em] text-slate-400">innovation score</p>
    </div>
  );
}
