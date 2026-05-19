"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { Card } from "@/ui/card";

type ActivityEvent = {
  id: string;
  label: string;
  time: string;
};

type LiveActivityFeedProps = {
  events: ActivityEvent[];
};

export function LiveActivityFeed({ events }: LiveActivityFeedProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="panel-heading">Live Activity</p>
          <h2 className="panel-subtitle">Innovation feed</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          Live
        </span>
      </div>
      <div className="mt-6 space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3"
          >
            <div className="mt-1 rounded-xl bg-white/10 p-2 text-sky-300">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-white">{event.label}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{event.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
