"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

type BreakdownDatum = {
  name: string;
  value: number;
  color: string;
};

type InnovationScoreBreakdownChartProps = {
  data: BreakdownDatum[];
};

export function InnovationScoreBreakdownChart({ data }: InnovationScoreBreakdownChartProps) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#e2e8f0", fontSize: 12 }}
            width={140}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            contentStyle={{ background: "#0b1220", borderRadius: 12, border: "1px solid rgba(148,163,184,0.25)" }}
            labelStyle={{ color: "#e2e8f0" }}
          />
          <Bar dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
