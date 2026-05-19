"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BarChart3, ShieldAlert, Signal, Timer, TrendingUp } from "lucide-react";

import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

export type InnovationTimelineStage = {
  year: number;
  title: string;
  summary: string;
  technology: string;
  market: string;
  impact: string;
  challenges: string;
};

type InnovationTimelineSimulatorProps = {
  stages: InnovationTimelineStage[];
};

export function InnovationTimelineSimulator({ stages }: InnovationTimelineSimulatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedStages = useMemo(() => stages.slice(0, 4), [stages]);
  const activeStage = orderedStages[activeIndex];
  const activeMeta = getStageMeta(activeIndex);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#050b18] p-6 lg:p-8 shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Innovation Timeline Simulator</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-100 drop-shadow-[0_0_18px_rgba(0,240,255,0.35)]">
            AI-Powered Innovation Evolution Engine
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            Trace how the idea evolves from present-day MVP to global impact.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" width={28} height={28} className="h-7 w-7 rounded-full border border-white/10" />
          Team_Vortex Projection
        </div>
      </div>

      <div className="relative mt-8 grid gap-10 lg:grid-cols-[120px_1fr_420px] items-start">
        <div className="relative flex flex-col items-center gap-6">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100%", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_24px_rgba(0,240,255,0.35)]"
          />
          {orderedStages.map((stage, index) => {
            const isActive = activeIndex === index;
            return (
              <motion.button
                key={stage.year}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-110"
                    : "border-cyan-400/20 bg-[#0f172a] text-slate-300 hover:border-cyan-400/40"
                }`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
              >
                {stage.year}
                {isActive && (
                  <span className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-70" />
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-20">
              <span className="absolute left-[15%] top-[18%] h-1.5 w-1.5 rounded-full bg-cyan-300/60 animate-pulse" />
              <span className="absolute left-[35%] top-[30%] h-1 w-1 rounded-full bg-sky-300/60 animate-pulse" />
              <span className="absolute left-[62%] top-[22%] h-1.5 w-1.5 rounded-full bg-purple-300/60 animate-pulse" />
              <span className="absolute left-[78%] top-[45%] h-1 w-1 rounded-full bg-cyan-300/60 animate-pulse" />
              <span className="absolute left-[28%] top-[60%] h-1.5 w-1.5 rounded-full bg-sky-300/60 animate-pulse" />
              <span className="absolute left-[55%] top-[70%] h-1 w-1 rounded-full bg-purple-300/60 animate-pulse" />
              <span className="absolute left-[80%] top-[75%] h-1.5 w-1.5 rounded-full bg-cyan-300/60 animate-pulse" />
            </div>
          </div>
          <div className="relative mb-6 h-[220px] rounded-[22px] border border-cyan-400/15 bg-[rgba(15,23,42,0.85)] p-4 shadow-[0_12px_30px_rgba(2,6,23,0.7)]">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <span>2025</span>
              <span>2037</span>
            </div>
            <div className="relative mt-4 h-[150px]">
              <svg className="h-full w-full" viewBox="0 0 320 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="evoGraph" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M10,120 C60,90 90,70 140,60 C190,50 220,35 260,30 C290,25 305,20 310,15"
                  stroke="url(#evoGraph)"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                />
              </svg>
              {[
                { label: "Early Traction", left: "8%", top: "68%" },
                { label: "Market Validation", left: "35%", top: "55%" },
                { label: "Scaling Phase", left: "62%", top: "38%" },
                { label: "Global Expansion", left: "85%", top: "20%" },
              ].map((node) => (
                <div key={node.label} className="group absolute" style={{ left: node.left, top: node.top }}>
                  <span className="block h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_12px_rgba(0,240,255,0.6)]" />
                  <span className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-cyan-400/20 bg-[#0b1220] px-2 py-1 text-[10px] text-slate-200 group-hover:block">
                    {node.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded-full border border-cyan-400/20 bg-[#0f172a] px-2 py-1">Innovation 92%</span>
              <span className="rounded-full border border-cyan-400/20 bg-[#0f172a] px-2 py-1">Risk: Medium</span>
              <span className="rounded-full border border-cyan-400/20 bg-[#0f172a] px-2 py-1">Adoption: Fast</span>
              <span className="rounded-full border border-cyan-400/20 bg-[#0f172a] px-2 py-1">Market: High</span>
            </div>
          </div>

          <div className="relative grid gap-5 md:grid-cols-2">
            {orderedStages.map((stage, index) => {
              const meta = getStageMeta(index);
              return (
                <motion.button
                  key={`${stage.year}-card`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`rounded-[18px] border bg-[rgba(15,23,42,0.85)] px-5 py-4 text-left shadow-[0_12px_30px_rgba(2,6,23,0.55)] transition-all duration-300 ${
                    activeIndex === index
                      ? "border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.25)]"
                      : "border-cyan-400/10 hover:border-cyan-400/30 hover:-translate-y-1"
                  }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stage.year}</p>
                  <span className="rounded-full border border-cyan-400/20 bg-[#0f172a] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                    {meta.maturity}
                  </span>
                </div>
                <h4 className="mt-2 text-sm font-semibold text-white">{stage.title}</h4>
                <p className="mt-2 text-sm text-slate-300 line-clamp-2">{stage.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200/80">
                  {meta.tags.map((tag) => (
                    <span
                      key={`${stage.year}-${tag}`}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>AI Confidence</span>
                      <span className="text-slate-200">{meta.confidence}%</span>
                    </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      style={{ width: `${meta.confidence}%` }}
                    />
                  </div>
                </div>
              </motion.button>
            );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.year}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="rounded-[22px] border border-cyan-400/20 bg-[rgba(15,23,42,0.92)] p-6 shadow-[0_18px_40px_rgba(2,6,23,0.6)]"
          >
            <div className="mb-4 flex items-center gap-3 text-slate-300">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-200">
                {activeStage.year}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Evolution Engine</p>
                <h4 className="text-lg font-semibold text-white">{activeStage.title}</h4>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">{activeStage.summary}</p>

            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <DetailRow label="Technology evolution" value={activeStage.technology} icon={Activity} />
              <DetailRow label="Market adoption" value={activeStage.market} icon={TrendingUp} />
              <DetailRow label="Industry impact" value={activeStage.impact} icon={BarChart3} />
              <DetailRow label="Challenges" value={activeStage.challenges} icon={ShieldAlert} />
              <DetailRow label="Real-world signals" value={activeMeta.signals} icon={Signal} />
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
              <MetricCard label="Impact score" value={`${activeMeta.impact}%`} />
              <MetricCard label="Adoption probability" value={`${activeMeta.adoption}%`} />
              <MetricCard label="Time to scale" value={activeMeta.timeToScale} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function getStageMeta(index: number) {
  const profiles = [
    {
      maturity: "Early",
      tags: ["MVP", "Signal"],
      confidence: 62,
      impact: 58,
      adoption: 46,
      timeToScale: "12-18 mo",
      signals: "Prototype demos, early pilots, advisor feedback",
    },
    {
      maturity: "Growth",
      tags: ["Growth", "Traction"],
      confidence: 70,
      impact: 66,
      adoption: 58,
      timeToScale: "10-14 mo",
      signals: "Beta users, conversion lift, ecosystem interest",
    },
    {
      maturity: "Scale",
      tags: ["Scale", "Platform"],
      confidence: 78,
      impact: 74,
      adoption: 66,
      timeToScale: "8-12 mo",
      signals: "Enterprise pilots, integration demand, data flywheel",
    },
    {
      maturity: "Global",
      tags: ["Global", "Ecosystem"],
      confidence: 84,
      impact: 82,
      adoption: 73,
      timeToScale: "6-10 mo",
      signals: "Regional partners, policy alignment, network effects",
    },
  ];
  return profiles[index] ?? profiles[0];
}
