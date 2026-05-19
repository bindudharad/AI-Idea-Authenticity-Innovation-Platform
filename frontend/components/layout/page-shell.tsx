"use client";

import { ReactNode } from "react";

type PageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="w-full space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-8 py-10 shadow-[0_24px_90px_rgba(2,6,23,0.42),0_0_42px_rgba(34,211,238,0.06)] backdrop-blur-lg transition-all duration-300 hover:border-cyan-300/15 sm:px-10 sm:py-12">
        <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        
        <div className="relative z-10 max-w-5xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
            <div className="h-1 w-1 rounded-full bg-cyan-400" />
            Intelligence Layer
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:leading-[1.12]">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-400 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-8">{children}</div>
    </div>
  );
}
