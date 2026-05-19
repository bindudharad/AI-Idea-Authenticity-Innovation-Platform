"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

import { useTilt } from "@/hooks/use-tilt";

type AnimatedButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export function AnimatedButton({
  children,
  href,
  className,
  onClick,
  type = "button",
  disabled = false,
}: AnimatedButtonProps) {
  const { ref, handlePointerEnter, handlePointerLeave, handlePointerMove } = useTilt<HTMLElement>({ maxTilt: 5, scale: 1.025 });

  const sharedProps = {
    ref: ref as never,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onPointerMove: handlePointerMove,
    "data-cursor": "interactive",
    className: clsx("tilt-surface transform-gpu", className),
  };

  if (href) {
    return (
      <Link href={href} {...sharedProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} {...sharedProps}>
      {children}
    </button>
  );
}
