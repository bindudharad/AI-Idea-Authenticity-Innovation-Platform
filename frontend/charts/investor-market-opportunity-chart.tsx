"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#52c7ff", "#8476ff", "#46d39a", "#ff835c", "#ffd16a"];

export function InvestorMarketOpportunityChart({
  data,
}: {
  data: Array<{ name: string; score: number }>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ background: "#0f1c31", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 18 }}
          />
          <Bar dataKey="score" radius={[12, 12, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={item.name} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
