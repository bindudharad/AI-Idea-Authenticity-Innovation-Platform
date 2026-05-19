"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, AlertTriangle, Trophy } from "lucide-react";

type StartupSuccessEngineProps = {
  probability: number;
  innovationStrength: string;
  marketFit: string;
  executionRisk: string;
  delay?: number;
};

export function StartupSuccessEngine({
  probability,
  innovationStrength,
  marketFit,
  executionRisk,
  delay = 0,
}: StartupSuccessEngineProps) {
  const factors = [
    { label: "Innovation Strength", value: innovationStrength, icon: Zap, color: "text-amber-400" },
    { label: "Market Fit", value: marketFit, icon: Trophy, color: "text-blue-400" },
    { label: "Execution Risk", value: executionRisk, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="relative h-32 w-32 flex items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 58}
              initial={{ strokeDashoffset: 2 * Math.PI * 58 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 58 * (1 - probability / 100) }}
              transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
              className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-white">{Math.round(probability)}%</span>
            <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Success Prob.</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
            <div className={`rounded-xl bg-white/5 p-2 ${f.color}`}>
              <f.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{f.label}</p>
              <p className="text-sm font-semibold text-white">{f.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <p className="text-[11px] text-emerald-300 leading-tight">
          Calculated using innovation depth, market saturation, and technical readiness signals.
        </p>
      </div>
    </motion.div>
  );
}
