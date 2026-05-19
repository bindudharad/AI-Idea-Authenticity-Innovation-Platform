"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

export function InvestmentProbabilityGauge({ value }: { value: number }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={[{ name: "Funding Probability", value, fill: "#52c7ff" }]}
          startAngle={210}
          endAngle={-30}
          barSize={22}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={30} />
          <text x="50%" y="48%" textAnchor="middle" className="fill-white text-4xl font-semibold">
            {Math.round(value)}%
          </text>
          <text x="50%" y="60%" textAnchor="middle" className="fill-slate-400 text-sm">
            funding probability
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
