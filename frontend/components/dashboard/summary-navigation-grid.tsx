"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/ui/card";

type SummaryNavigationItem = {
  href: string;
  title: string;
  description: string;
};

type SummaryNavigationGridProps = {
  items: SummaryNavigationItem[];
};

export function SummaryNavigationGrid({ items }: SummaryNavigationGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="panel-hover h-full rounded-[26px] border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-400/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
