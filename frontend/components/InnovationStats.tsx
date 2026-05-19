"use client";

import { LucideIcon } from "lucide-react";

import { AnimatedCounter } from "@/components/animations/animated-counter";
import { Card } from "@/ui/card";

type StatItem = {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
};

type InnovationStatsProps = {
  stats: StatItem[];
  title?: string;
  subtitle?: string;
};

export function InnovationStats({
  stats,
  title = "Innovation Stats",
  subtitle = "Personal innovation momentum",
}: InnovationStatsProps) {
  return (
    <Card>
      <p className="panel-heading">Innovation Stats</p>
      <h2 className="panel-subtitle">{title}</h2>
      <p className="mt-3 text-sm text-slate-300">{subtitle}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    <AnimatedCounter value={stat.value} />
                    {stat.suffix ?? ""}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 text-sky-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
