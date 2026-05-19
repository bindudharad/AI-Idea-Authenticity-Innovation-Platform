"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ImpactTimelineChart({
  data,
}: {
  data: Array<Record<string, string | number>>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#0f1c31", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 18 }} />
          <Legend />
          <Line type="monotone" dataKey="adoption" stroke="#64f1d6" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="impact" stroke="#ff835c" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
