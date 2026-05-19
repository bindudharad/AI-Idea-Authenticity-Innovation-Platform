"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import clsx from "clsx";

import { Card } from "@/ui/card";

type FeatureAccordionProps = {
  title: string;
  preview: string;
  icon: ReactNode;
  isOpen: boolean;
  disabled?: boolean;
  fullPageHref: string;
  onToggle: () => void;
  children: ReactNode;
};

export function FeatureAccordion({
  title,
  preview,
  icon,
  isOpen,
  disabled = false,
  fullPageHref,
  onToggle,
  children,
}: FeatureAccordionProps) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowLoading(false);
      return;
    }

    setShowLoading(true);
    const timer = window.setTimeout(() => setShowLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  return (
    <Card className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-0 shadow-panel transition-colors duration-200 hover:bg-white/[0.05]">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={clsx(
          "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
          disabled ? "cursor-default opacity-85" : "",
        )}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-cyan-300">
            {icon}
          </div>
          <div>
            <p className="text-base font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{preview}</p>
          </div>
        </div>

        <ChevronRight
          className={clsx(
            "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen ? "rotate-90" : "",
          )}
        />
      </button>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "max-h-[820px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t border-white/8 px-5 py-5">
          {isOpen ? (
            showLoading ? (
              <div className="rounded-[18px] border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-300">
                Loading insights...
              </div>
            ) : (
              <div className="space-y-5">
                {children}
                <div className="flex justify-end">
                  <Link
                    href={fullPageHref}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors duration-200 hover:border-cyan-300/50 hover:bg-cyan-500/15"
                  >
                    View Full Details
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </Card>
  );
}
