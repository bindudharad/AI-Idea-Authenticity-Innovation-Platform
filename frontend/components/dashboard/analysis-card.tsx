"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

import { Card } from "@/ui/card";

type AnalysisCardProps = {
  title: string;
  eyebrow: string;
  summary: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function AnalysisCard({
  title,
  eyebrow,
  summary,
  defaultOpen = true,
  children,
}: AnalysisCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="panel-hover overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-6 py-6 text-left"
      >
        <div>
          <p className="panel-heading">{eyebrow}</p>
          <h2 className="panel-subtitle">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{summary}</p>
        </div>
        <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <ChevronDown className={`h-4 w-4 text-slate-200 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="px-6 py-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
