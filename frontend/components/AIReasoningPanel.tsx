"use client";

import { motion } from "framer-motion";

import { Card } from "@/ui/card";

type AIReasoningPanelProps = {
  title?: string;
  bullets?: string[];
  summary?: string;
};

const defaultBullets = [
  "moderate patent similarity detected",
  "strong technology novelty signals",
  "medium competitive density",
  "high market demand potential",
];

export function AIReasoningPanel({
  title = "AI Innovation Reasoning",
  bullets = defaultBullets,
  summary = "The score blends semantic similarity, patent density, and competitive signals to estimate true originality.",
}: AIReasoningPanelProps) {
  return (
    <Card>
      <p className="panel-heading">AI Innovation Reasoning</p>
      <h2 className="panel-subtitle">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {bullets.map((bullet, index) => (
          <motion.div
            key={`${bullet}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-200"
          >
            {bullet}
          </motion.div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300">{summary}</p>
    </Card>
  );
}
