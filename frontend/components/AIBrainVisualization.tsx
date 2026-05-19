"use client";

import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";
import { motion } from "framer-motion";

import { Card } from "@/ui/card";

import "reactflow/dist/style.css";

type BrainStep = {
  id: string;
  label: string;
  subtitle: string;
};

type AIBrainVisualizationProps = {
  onComplete?: () => void;
  className?: string;
};

const steps: BrainStep[] = [
  { id: "user", label: "User Idea", subtitle: "Input received" },
  { id: "analysis", label: "Idea Analysis Agent", subtitle: "Understanding context" },
  { id: "patent", label: "Patent Intelligence Agent", subtitle: "Scanning patents" },
  { id: "tech", label: "Technology Scanner Agent", subtitle: "Mapping technologies" },
  { id: "similarity", label: "Similarity Detection Agent", subtitle: "Computing overlap" },
  { id: "score", label: "Innovation Scoring Agent", subtitle: "Score generated" },
];

export function AIBrainVisualization({ onComplete, className }: AIBrainVisualizationProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((index) => {
        if (index >= steps.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => onComplete?.(), 200); // Faster completion
          return index;
        }
        return index + 1;
      });
    }, 300); // Faster step transition (300ms instead of 850ms)

    return () => window.clearInterval(interval);
  }, [onComplete]);

  const nodes = useMemo<Node[]>(
    () =>
      [
        { id: "user", position: { x: 0, y: 120 } },
        { id: "analysis", position: { x: 220, y: 40 } },
        { id: "patent", position: { x: 440, y: 0 } },
        { id: "tech", position: { x: 440, y: 180 } },
        { id: "similarity", position: { x: 660, y: 80 } },
        { id: "score", position: { x: 880, y: 120 } },
      ].map((node) => {
        const stepIndex = steps.findIndex((step) => step.id === node.id);
        const active = stepIndex <= activeIndex;
        const highlight = stepIndex === activeIndex;

        return {
          ...node,
          data: {
            label: steps[stepIndex]?.label ?? node.id,
          },
          draggable: false,
          selectable: false,
          className: `ai-brain-node ${active ? "ai-brain-node--active" : ""} ${highlight ? "ai-brain-node--highlight" : ""}`,
        };
      }),
    [activeIndex],
  );

  const edges = useMemo<Edge[]>(
    () =>
      [
        { id: "e1", source: "user", target: "analysis" },
        { id: "e2", source: "analysis", target: "patent" },
        { id: "e3", source: "analysis", target: "tech" },
        { id: "e4", source: "patent", target: "similarity" },
        { id: "e5", source: "tech", target: "similarity" },
        { id: "e6", source: "similarity", target: "score" },
      ].map((edge, index) => ({
        ...edge,
        animated: true,
        className: `ai-brain-edge ${index <= activeIndex ? "ai-brain-edge--active" : ""}`,
      })),
    [activeIndex],
  );

  const currentStep = steps[Math.min(activeIndex, steps.length - 1)];

  return (
    <Card className={className}>
      <p className="panel-heading">AI Brain</p>
      <h2 className="panel-subtitle">Neural intelligence flow</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-[360px] rounded-[24px] border border-white/10 bg-black/40">
          <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false}>
            <Background color="#1e293b" gap={30} size={1} />
            <Controls showInteractive={false} className="!rounded-2xl !border !border-white/10 !bg-slate-950/90" />
          </ReactFlow>
        </div>
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active Agent</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{currentStep.label}</h3>
          <p className="mt-3 text-sm text-slate-300">{currentStep.subtitle}</p>
          {activeIndex >= steps.length - 1 ? (
            <p className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              Innovation Score Generated
            </p>
          ) : null}
        </motion.div>
      </div>
    </Card>
  );
}
