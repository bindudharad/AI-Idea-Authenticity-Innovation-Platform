"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

import { AnimatedCounter } from "@/components/animations/animated-counter";
import { Card } from "@/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: "blue" | "violet" | "amber" | "emerald" | "coral";
  animatedValue?: number;
  valueSuffix?: string;
  decimals?: number;
};

const accentStyles = {
  blue: "from-sky-400/18 via-sky-400/8 to-transparent text-sky-300",
  violet: "from-violet-400/18 via-violet-400/8 to-transparent text-violet-300",
  amber: "from-amber-300/18 via-amber-300/8 to-transparent text-amber-200",
  emerald: "from-emerald-400/18 via-emerald-400/8 to-transparent text-emerald-300",
  coral: "from-orange-400/18 via-orange-400/8 to-transparent text-orange-300",
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "blue",
  animatedValue,
  valueSuffix,
  decimals,
}: MetricCardProps) {
  return (
    <motion.div initial={false} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="panel-hover overflow-hidden p-0">
        <div className={`bg-gradient-to-br ${accentStyles[accent]} p-6`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="panel-heading">{label}</p>
              <p className="stat-value mt-4">
                {typeof animatedValue === "number" ? (
                  <AnimatedCounter value={animatedValue} suffix={valueSuffix} decimals={decimals} />
                ) : (
                  value
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-300">{detail}</p>
        </div>
      </Card>
    </motion.div>
  );
}
