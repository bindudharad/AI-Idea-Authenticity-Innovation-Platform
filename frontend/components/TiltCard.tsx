"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import clsx from "clsx";

import { useTilt } from "@/hooks/use-tilt";

type TiltCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  glareClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function TiltCard<T extends ElementType = "div">({
  as,
  children,
  className,
  glareClassName,
  ...props
}: TiltCardProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const { ref, handlePointerEnter, handlePointerLeave, handlePointerMove } = useTilt<HTMLElement>();

  return (
    <Component
      ref={ref as never}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      data-cursor="interactive"
      className={clsx(
        "tilt-surface relative isolate transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_var(--pointer-x,50%)_var(--pointer-y,50%),rgba(255,255,255,0.18),transparent_34%)] opacity-[var(--pointer-opacity,0)] transition-opacity duration-300",
          glareClassName,
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-[inherit] border border-white/6 opacity-60"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </Component>
  );
}
