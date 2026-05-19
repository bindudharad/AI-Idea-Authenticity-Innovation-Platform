"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type JudgingScoreChartProps = {
  scores: Record<string, number>;
};

export function JudgingScoreChart({ scores }: JudgingScoreChartProps) {
  const data = Object.entries(scores).map(([key, value]) => ({
    metric: key.replace(/_/g, " "),
    score: Math.round(Number(value) * 10),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
          <XAxis dataKey="metric" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: "rgba(56,189,248,0.08)" }}
            contentStyle={{
              background: "#020617",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: "16px",
              color: "#e2e8f0",
            }}
          />
          <Bar dataKey="score" fill="url(#judgingGradient)" radius={[10, 10, 0, 0]} />
          <defs>
            <linearGradient id="judgingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
