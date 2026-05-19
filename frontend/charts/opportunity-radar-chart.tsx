"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

type OpportunityRadarDatum = {
  metric: string;
  value: number;
};

type OpportunityRadarChartProps = {
  data: OpportunityRadarDatum[];
};

export function OpportunityRadarChart({ data }: OpportunityRadarChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
          <Radar
            dataKey="value"
            stroke="rgba(56, 189, 248, 0.9)"
            fill="rgba(56, 189, 248, 0.25)"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
