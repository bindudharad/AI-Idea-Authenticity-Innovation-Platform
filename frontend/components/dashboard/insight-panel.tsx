"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Card } from "@/ui/card";

type InsightPanelProps = {
  title?: string;
  insights: string[];
};

export function InsightPanel({ title = "AI Insights", insights }: InsightPanelProps) {
  return (
    <Card className="panel-hover overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="panel-heading">{title}</p>
          <h2 className="panel-subtitle">Strategic intelligence synthesized for the team</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 to-violet-400/20 text-sky-200">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {insights.map((insight, index) => (
          <motion.div
            key={insight}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 text-sm leading-7 text-slate-200"
          >
            {insight}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
