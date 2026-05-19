import { ReactNode } from "react";
import clsx from "clsx";

type BadgeProps = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "info";
  className?: string;
};

export function Badge({ children, tone = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        tone === "success" && "border-glow/40 bg-glow/10 text-glow",
        tone === "warning" && "border-coral/40 bg-coral/10 text-coral",
        tone === "info" && "border-sky-400/40 bg-sky-400/10 text-sky-200",
        tone === "default" && "border-white/10 bg-white/[0.06] text-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}
