"use client";

import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  className,
  children,
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen}
      className={clsx(
        "group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-panel",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180 group-open:text-cyan-300" />
      </summary>
      <div className="mt-5 border-t border-white/8 pt-5 text-sm leading-7 text-slate-300">{children}</div>
    </details>
  );
}
