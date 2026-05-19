"use client";

import clsx from "clsx";
import { Bot } from "lucide-react";

type AIAvatarProps = {
  size?: "sm" | "md" | "lg";
  active?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export function AIAvatar({ size = "md", active = false, className }: AIAvatarProps) {
  return (
    <div
      className={clsx(
        "ai-avatar relative flex items-center justify-center rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(145deg,rgba(34,211,238,0.14),rgba(59,130,246,0.10),rgba(148,163,184,0.06))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(2,6,23,0.24)]",
        sizeMap[size],
        active && "ai-avatar-active",
        className,
      )}
    >
      <span className="absolute inset-[3px] rounded-full border border-white/8" />
      <Bot className="relative z-10 h-1/2 w-1/2 text-cyan-100/90" />
    </div>
  );
}
