"use client";

import { motion } from "framer-motion";

import { Card } from "@/ui/card";

type GeneSegment = {
  label: string;
  value: number;
  color: string;
};

type IdeaGenomeVisualizationProps = {
  segments?: GeneSegment[];
};

const defaultSegments: GeneSegment[] = [
  { label: "Technology Genes", value: 78, color: "bg-sky-400" },
  { label: "Market Genes", value: 64, color: "bg-emerald-400" },
  { label: "Innovation Genes", value: 82, color: "bg-violet-400" },
  { label: "Risk Genes", value: 48, color: "bg-amber-400" },
  { label: "Impact Genes", value: 71, color: "bg-pink-400" },
];

export function IdeaGenomeVisualization({ segments = defaultSegments }: IdeaGenomeVisualizationProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <Card>
      <p className="panel-heading">Idea Genome</p>
      <h2 className="panel-subtitle">Innovation trait sequencing</h2>
      <div className="mt-6 space-y-4">
        {segments.map((segment, index) => {
          const width = `${Math.max(6, Math.round((segment.value / total) * 100))}%`;
          return (
            <div key={segment.label} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{segment.label}</span>
                <span className="text-white">{segment.value}</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-3 rounded-full ${segment.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
