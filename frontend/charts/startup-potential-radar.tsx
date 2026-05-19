"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

type StartupPotentialRadarProps = {
  data: { metric: string; value: number }[];
};

export function StartupPotentialRadar({ data }: StartupPotentialRadarProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(148,163,184,0.18)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#a9b7cf", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: "#0f1c31",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 18
            }}
          />
          <Radar dataKey="value" stroke="#ff835c" fill="#ff835c" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
