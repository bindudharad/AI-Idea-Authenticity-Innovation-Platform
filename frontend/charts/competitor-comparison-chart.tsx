"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CompetitorComparisonChart({
  data,
}: {
  data: Array<Record<string, string | number>>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={10}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "#091327",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 18,
            }}
          />
          <Legend />
          <Bar dataKey="maturity" name="Technology" radius={[10, 10, 0, 0]} fill="#8476ff" />
          <Bar dataKey="traction" name="Traction" radius={[10, 10, 0, 0]} fill="#52c7ff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
