"use client";

import { ReactNode } from "react";
import clsx from "clsx";

import { AnimatedButton } from "@/components/AnimatedButton";

type PremiumButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const variants = {
  primary:
    "border border-cyan-200/16 bg-[linear-gradient(90deg,#3b82f6,#06b6d4)] text-white shadow-[0_0_20px_rgba(59,130,246,0.32)] hover:shadow-[0_0_30px_rgba(6,182,212,0.42)]",
  secondary:
    "border border-white/12 bg-white/[0.055] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(2,6,23,0.16)] backdrop-blur-xl hover:border-cyan-200/18 hover:bg-white/[0.07]",
  ghost:
    "border border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.045] hover:text-white",
};

const sizes = {
  default: "px-6 py-3",
  sm: "px-4 py-2.5 text-xs",
};

export function PremiumButton({
  children,
  href,
  className,
  variant = "primary",
  size = "default",
  onClick,
  type = "button",
  disabled = false,
}: PremiumButtonProps) {
  const styles = clsx(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-semibold tracking-[0.01em] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.985]",
    "before:absolute before:inset-0 before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.16),transparent)] before:translate-x-[-160%] before:transition-transform before:duration-700 hover:before:translate-x-[150%]",
    disabled && "cursor-not-allowed opacity-50 grayscale",
    sizes[size],
    variants[variant],
    className,
  );

  if (href) {
    return (
      <AnimatedButton href={href} className={styles}>
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </AnimatedButton>
    );
  }

  return (
    <AnimatedButton type={type} className={styles} onClick={onClick} disabled={disabled}>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </AnimatedButton>
  );
}
