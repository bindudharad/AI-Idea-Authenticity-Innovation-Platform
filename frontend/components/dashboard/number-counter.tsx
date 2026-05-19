"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

type NumberCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  label?: string;
};

export function NumberCounter({
  value,
  suffix = "",
  prefix = "",
  className = "",
  label,
}: NumberCounterProps) {
  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 20,
    mass: 1,
  });

  const displayValue = useTransform(springValue, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          {label}
        </p>
      )}
      <div className="relative">
        {/* Glow Background */}
        <div className="absolute inset-0 blur-2xl bg-cyan-500/10 -z-10 rounded-full" />
        
        <motion.div className="flex items-baseline gap-1">
          {prefix && <span className="text-2xl font-bold text-cyan-400">{prefix}</span>}
          <motion.span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {displayValue}
          </motion.span>
          {suffix && <span className="text-2xl font-bold text-cyan-400">{suffix}</span>}
        </motion.div>
      </div>
    </div>
  );
}
