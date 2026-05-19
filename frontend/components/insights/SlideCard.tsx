"use client";

import { motion } from "framer-motion";

import { PitchSlide } from "@/types/api";
import { Card } from "@/ui/card";

export function SlideCard({
  slide,
  index,
  active,
}: {
  slide: PitchSlide;
  index: number;
  active?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className={active ? "border-sky-400/30 shadow-[0_0_0_1px_rgba(82,199,255,0.14)]" : undefined}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Slide {index + 1}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{slide.title}</h3>
          </div>
          {active ? <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">Active</span> : null}
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-200">{slide.content}</p>
      </Card>
    </motion.div>
  );
}
