"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

const steps = [
  "Analyzing idea structure...",
  "Scanning patents...",
  "Searching technologies...",
  "Computing similarity...",
  "Generating innovation score...",
];

export function AnalysisLoadingOverlay({ open }: { open: boolean }) {
  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setVisibleStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleStep((current) => Math.min(current + 1, steps.length - 1));
    }, 800);

    return () => window.clearInterval(interval);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(3,7,18,0.82)] backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="mx-4 w-full max-w-xl rounded-[32px] border border-white/10 bg-[rgba(8,18,34,0.92)] p-8 shadow-[0_32px_90px_rgba(2,6,23,0.55)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/12 text-sky-300">
                <Image
                  src={imageWithVersion(TEAM_VORTEX_ICON)}
                  alt="Team Vortex"
                  width={40}
                  height={40}
                  className="team-badge h-10 w-10 object-contain"
                />
              </div>
              <div>
                <p className="panel-heading">Initializing Team_Vortex AI Engine</p>
                <h2 className="panel-subtitle mt-2">Running innovation intelligence analysis</h2>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: index <= visibleStep ? 1 : 0.28, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-200"
                >
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
