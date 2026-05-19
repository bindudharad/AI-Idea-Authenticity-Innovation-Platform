"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import { BlackholeAnalysis } from "@/engines/blackholeDetector";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function InnovationBlackhole({ analysis }: { analysis: BlackholeAnalysis }) {
  const isHighRisk = analysis.blackholeScore > 70;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Innovation Blackhole Analysis</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Saturation risk detection</h2>
        </div>
        <Badge tone={isHighRisk ? "warning" : "success"}>{analysis.riskLevel}</Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Patent density" value={analysis.patentDensity} />
        <Metric label="Startup competition" value={analysis.startupCompetition} />
        <Metric label="Research density" value={analysis.researchDensity} />
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isHighRisk ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={isHighRisk ? { repeat: Infinity, duration: 1.6 } : { duration: 0.4 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200"
          >
            <AlertTriangle className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Blackhole Score</p>
            <p className="text-2xl font-semibold text-white">{Math.round(analysis.blackholeScore)}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">{analysis.recommendation}</p>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400/70 via-indigo-400/70 to-emerald-300/70"
            style={{ width: `${Math.max(6, Math.min(100, Math.round(value)))}%` }}
          />
        </div>
        <p className="mt-3 text-lg font-semibold text-white">{Math.round(value)}%</p>
      </div>
    </div>
  );
}
