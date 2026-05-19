"use client";

import { motion } from "framer-motion";

import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { formatStableDateTime } from "@/lib/format";

type TimelineItem = {
  id: string;
  ideaName: string;
  innovationScore: number;
  analysisDate: string;
};

type IdeaTimelineProps = {
  items: TimelineItem[];
  title?: string;
  description?: string;
};

export function IdeaTimeline({
  items,
  title = "Idea History Timeline",
  description = "Chronological view of your analyzed ideas.",
}: IdeaTimelineProps) {
  return (
    <Card>
      <p className="panel-heading">Idea History</p>
      <h2 className="panel-subtitle">{title}</h2>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300">
            No analysis history yet. Run your first idea analysis to build the timeline.
          </div>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{item.ideaName}</p>
                  <p className="mt-2 text-sm text-slate-400">{formatStableDateTime(item.analysisDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Innovation Score</p>
                  <p className="text-2xl font-semibold text-white">{Math.round(item.innovationScore)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary">View Results</Button>
                <Button variant="secondary">Download Report</Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
