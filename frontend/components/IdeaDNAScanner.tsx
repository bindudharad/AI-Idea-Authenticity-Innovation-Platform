"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

export type IdeaDnaGene = {
  key: string;
  label: string;
  score: number;
  color: string;
  description: string;
};

export type IdeaDnaSummary = {
  label: string;
  value: string;
};

type IdeaDNAScannerProps = {
  genes: IdeaDnaGene[];
  summary: IdeaDnaSummary[];
};

const scanSteps = [
  "Scanning innovation genome...",
  "Analyzing technology genes...",
  "Evaluating market genes...",
  "Constructing innovation DNA...",
];

export function IdeaDNAScanner({ genes, summary }: IdeaDNAScannerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showDna, setShowDna] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    setReduceMotion(prefersReduced || deviceMemory < 4);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setShowDna(true);
      return;
    }

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    scanSteps.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setStepIndex(index);
        }, index * 900),
      );
    });
    timers.push(
      setTimeout(() => {
        setShowDna(true);
      }, scanSteps.length * 900 + 300),
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [reduceMotion]);

  const orderedGenes = useMemo(() => genes.slice(0, 6), [genes]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(82,199,255,0.12),transparent_35%),linear-gradient(140deg,rgba(5,12,26,0.96),rgba(8,18,34,0.92))] p-6 lg:p-8">
      <div className="absolute inset-0 opacity-40 dna-grid" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400">Idea DNA Scanner</p>
          <h3 className="text-2xl font-semibold text-white">Idea DNA Profile</h3>
          <p className="text-sm leading-7 text-slate-300">
            The innovation genome summarizes how technology, market signals, originality, research alignment, risk, and
            impact combine into a single DNA signature.
          </p>

          <div className="grid gap-3">
            {summary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <span className="text-slate-400">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" width={32} height={32} className="h-8 w-8 rounded-full border border-white/10" />
            Team_Vortex Innovation Genome
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!showDna ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="flex min-h-[280px] w-full items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.03] px-6 text-center text-sm text-slate-300"
              >
                {scanSteps[stepIndex] ?? scanSteps[scanSteps.length - 1]}
              </motion.div>
            ) : (
              <motion.div
                key="dna"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="relative w-full max-w-[360px] rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-8"
              >
                <motion.div
                  className="mx-auto flex w-full flex-col items-center gap-4"
                  animate={reduceMotion ? undefined : { rotateZ: [0, 1.5, -1.5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {orderedGenes.map((gene, index) => (
                    <div key={gene.key} className="group relative flex w-full items-center justify-between gap-3">
                      <motion.div
                        className="dna-node"
                        style={{ backgroundColor: gene.color }}
                        animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
                        transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.15 }}
                      />
                      <div className="dna-connector">
                        <motion.div
                          className="dna-flow"
                          style={{ backgroundColor: gene.color }}
                          animate={reduceMotion ? undefined : { x: ["-40%", "40%", "-40%"] }}
                          transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
                        />
                      </div>
                      <motion.div
                        className="dna-node"
                        style={{ backgroundColor: gene.color }}
                        animate={reduceMotion ? undefined : { opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
                        transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.2 }}
                      />
                      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-[120%] rounded-[16px] border border-white/10 bg-slate-950/90 px-4 py-2 text-xs text-slate-200 shadow-[0_0_24px_rgba(96,165,250,0.35)] group-hover:block">
                        <p className="font-semibold text-white">{gene.label}</p>
                        <p className="mt-1 text-[11px] text-slate-300">{gene.description}</p>
                      </div>
                      <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[110%] rounded-[14px] border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white group-hover:block">
                        {Math.round(gene.score)}
                      </div>
                    </div>
                  ))}
                </motion.div>
                <div className="mt-6 text-center text-xs uppercase tracking-[0.24em] text-slate-400">
                  Innovation Score Generated
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
