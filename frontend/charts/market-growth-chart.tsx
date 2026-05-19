"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MarketGrowthChart({
  data,
}: {
  data: Array<Record<string, string | number>>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="marketGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52c7ff" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#52c7ff" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#091327",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 18,
            }}
          />
          <Area type="monotone" dataKey="projection" stroke="#52c7ff" strokeWidth={3} fill="url(#marketGrowthFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
