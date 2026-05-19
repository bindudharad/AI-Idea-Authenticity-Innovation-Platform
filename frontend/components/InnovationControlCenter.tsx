"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Globe2, Radar } from "lucide-react";

import { Card } from "@/ui/card";

type InnovationControlCenterProps = {
  recentAnalyses: Array<{ id: string; idea: string; score: number }>;
  globalTrends: string[];
  simulations: number;
};

export function InnovationControlCenter({
  recentAnalyses,
  globalTrends,
  simulations,
}: InnovationControlCenterProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="panel-heading">Innovation Control Center</p>
          <h2 className="panel-subtitle">Mission-control analytics</h2>
          <p className="mt-3 text-sm text-slate-300">
            Real-time intelligence of active analyses, simulations, and macro innovation momentum.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-sky-300">
          <Radar className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {recentAnalyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{analysis.idea}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent analysis</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Score</p>
                <p className="text-xl font-semibold text-white">{analysis.score}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <Globe2 className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-semibold text-white">Global innovation trends</p>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {globalTrends.map((trend) => (
                <li key={trend} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {trend}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4 text-violet-300" />
              <p className="text-sm font-semibold text-white">Active simulations</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{simulations}</p>
            <p className="mt-2 text-xs text-slate-400">Running scenario recalculations</p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-sky-300" />
              <p className="text-sm font-semibold text-white">Innovation heatmap</p>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {Array.from({ length: 18 }).map((_, index) => (
                <div
                  key={index}
                  className="h-3 rounded-full bg-gradient-to-r from-sky-400/20 via-violet-400/30 to-emerald-300/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
