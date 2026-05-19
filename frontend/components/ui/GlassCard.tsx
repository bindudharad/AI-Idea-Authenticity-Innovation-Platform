"use client";

import { ReactNode } from "react";
import clsx from "clsx";

import { TiltCard } from "@/components/TiltCard";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <TiltCard
      className={clsx(
        "glass-card subtle-panel premium-border p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/12 hover:shadow-[0_20px_48px_rgba(15,23,42,0.28)]",
        className,
      )}
    >
      {children}
    </TiltCard>
  );
}
