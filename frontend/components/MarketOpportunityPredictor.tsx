"use client";

import { motion } from "framer-motion";
import { TrendingUp, Globe2, BarChart3, Rocket } from "lucide-react";

type MarketOpportunityPredictorProps = {
  score: number;
  marketSize: string;
  competition: string;
  growthPotential: string;
  delay?: number;
};

export function MarketOpportunityPredictor({
  score,
  marketSize,
  competition,
  growthPotential,
  delay = 0,
}: MarketOpportunityPredictorProps) {
  const metrics = [
    { label: "Market Size", value: marketSize, icon: Globe2, color: "text-cyan-400" },
    { label: "Competition", value: competition, icon: BarChart3, color: "text-purple-400" },
    { label: "Growth Potential", value: growthPotential, icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Market Opportunity</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{Math.round(score)}</span>
            <span className="text-sm font-bold text-cyan-400">/ 100</span>
          </div>
        </div>
        <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Rocket className="h-8 w-8" />
        </div>
      </div>

      <div className="grid gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-white/5 p-2 ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-slate-400">{m.label}</span>
            </div>
            <span className="text-sm font-bold text-white">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.5 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        />
      </div>
    </motion.div>
  );
}
