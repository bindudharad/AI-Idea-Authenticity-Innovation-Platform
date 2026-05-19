"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  delay?: number;
};

export function DashboardCard({
  title,
  subtitle,
  className,
  children,
  delay = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={clsx(
        "group relative overflow-hidden rounded-[24px] border border-white/[0.05] bg-[#0f172a]/40 p-7 backdrop-blur-2xl transition-all duration-300 hover:border-white/10 hover:bg-[#0f172a]/60",
        className
      )}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className="h-1 w-1 rounded-full bg-cyan-400/40" />
      </div>

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
