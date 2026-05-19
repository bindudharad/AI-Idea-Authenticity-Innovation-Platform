"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MarketOpportunityChart({
  data,
}: {
  data: Array<Record<string, string | number>>;
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="marketFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64f1d6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#64f1d6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a9b7cf", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#0f1c31", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 18 }} />
          <Area type="monotone" dataKey="market_index" stroke="#64f1d6" fill="url(#marketFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
