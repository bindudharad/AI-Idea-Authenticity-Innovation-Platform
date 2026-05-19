"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Database, Sparkles, Waves } from "lucide-react";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

const steps = [
  "Initializing AI analysis...",
  "Scanning idea structure...",
  "Detecting technologies...",
  "Searching patent databases...",
  "Analyzing research papers...",
  "Calculating innovation score...",
  "Generating AI insights...",
];

const agents = [
  { label: "Idea Analyzer", icon: Sparkles },
  { label: "Patent Scanner", icon: Database },
  { label: "Research Analyzer", icon: Waves },
  { label: "Innovation Score Engine", icon: Cpu },
];

export function AIThinkingAnimation({ open, currentStatus }: { open: boolean; currentStatus?: string }) {
  const [visibleStep, setVisibleStep] = useState(0);
  const [dots, setDots] = useState("");
  const [liveStatus, setLiveStatus] = useState("");

  useEffect(() => {
    if (!open) {
      setVisibleStep(0);
      setDots("");
      setLiveStatus("");
      return;
    }

    const stepInterval = window.setInterval(() => {
      setVisibleStep((current) => Math.min(current + 1, steps.length - 1));
    }, 520);

    const dotsInterval = window.setInterval(() => {
      setDots((current) => (current.length >= 3 ? "" : `${current}.`));
    }, 450);

    return () => {
      window.clearInterval(stepInterval);
      window.clearInterval(dotsInterval);
    };
  }, [open]);

  useEffect(() => {
    if (currentStatus) {
      setLiveStatus(currentStatus);
    }
  }, [currentStatus]);

  const progress = useMemo(() => {
    if (!open) return 0;
    return Math.round(((visibleStep + 1) / steps.length) * 100);
  }, [open, visibleStep]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(3,7,18,0.75)] backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="mx-4 w-full max-w-2xl rounded-[32px] border border-white/10 bg-[rgba(8,18,34,0.94)] p-8 shadow-[0_35px_90px_rgba(2,6,23,0.65)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="panel-heading text-sky-300">Real-time AI Thinking</p>
                <h2 className="panel-subtitle mt-2 text-white">Processing innovation intelligence</h2>
              </div>
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-300">
                Live
              </span>
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-cyan-300/15 bg-cyan-400/[0.06] px-5 py-4 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-300/30 border-t-cyan-300 animate-[spin_3.2s_linear_infinite]" />
                <Image
                  src={imageWithVersion(TEAM_VORTEX_ICON)}
                  alt="TEAM VORTEX"
                  width={40}
                  height={40}
                  priority
                  className="relative h-10 w-10 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.28)]"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">TEAM_VORTEX AI Engine</p>
                <p className="mt-2 text-sm text-slate-300">Saving once, generating a canonical report, and preparing every workspace section for instant reuse.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {liveStatus ? (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between rounded-[22px] border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-200"
                >
                  <span>{liveStatus}</span>
                  <span className="text-xs text-sky-300">Live{dots}</span>
                </motion.div>
              ) : (
                steps.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: index <= visibleStep ? 1 : 0.25, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                  >
                    <span>{step}</span>
                    {index <= visibleStep ? (
                      <span className="text-xs text-sky-300">Active{dots}</span>
                    ) : (
                      <span className="text-xs text-slate-500">Queued</span>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Processing</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.35 }}
                />
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                const isActive = visibleStep >= index + 1;
                return (
                  <div
                    key={agent.label}
                    className={`flex items-center gap-3 rounded-[18px] border border-white/10 px-4 py-3 text-sm transition ${
                      isActive ? "bg-sky-400/10 text-sky-200" : "bg-white/[0.03] text-slate-400"
                    }`}
                  >
                    <div className={`rounded-xl p-2 ${isActive ? "bg-sky-400/20 text-sky-200" : "bg-white/5 text-slate-500"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.label}</p>
                      <p className="text-xs">{isActive ? "Active" : "Processing"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
