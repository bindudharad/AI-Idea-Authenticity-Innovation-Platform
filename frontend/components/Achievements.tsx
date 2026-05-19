"use client";

import { motion } from "framer-motion";

import { Card } from "@/ui/card";

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

type AchievementsProps = {
  achievements: Achievement[];
};

export function Achievements({ achievements }: AchievementsProps) {
  return (
    <Card>
      <p className="panel-heading">Innovation Achievements</p>
      <h2 className="panel-subtitle">Gamified milestones</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-[22px] border p-4 ${
              achievement.unlocked
                ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                : "border-white/10 bg-white/[0.04] text-slate-200"
            }`}
          >
            <p className="text-sm font-semibold">{achievement.title}</p>
            <p className="mt-2 text-xs leading-6 text-slate-300">{achievement.description}</p>
            <span className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
              {achievement.unlocked ? "Unlocked" : "Locked"}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
