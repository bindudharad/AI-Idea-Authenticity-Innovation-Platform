"use client";

import { StartupPotentialRadar } from "@/charts/startup-potential-radar";

type InnovationRadarProps = {
  metrics: { metric: string; value: number }[];
};

export function InnovationRadar({ metrics }: InnovationRadarProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <p className="panel-heading">Innovation Radar</p>
      <h2 className="panel-subtitle">Personal strength profile</h2>
      <div className="mt-4">
        <StartupPotentialRadar data={metrics} />
      </div>
    </div>
  );
}
