"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { similarIdeas } from "@/services/mock-data";
import { SimilarIdea } from "@/types/idea";

const colors = ["#64f1d6", "#82cfff", "#ffd16a", "#ff835c"];

type SimilarityBarChartProps = {
  data?: SimilarIdea[];
};

export function SimilarityBarChart({ data = similarIdeas }: SimilarityBarChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="title" tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ background: "#0f1c31", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 18 }}
          />
          <Bar dataKey="score" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.title} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
