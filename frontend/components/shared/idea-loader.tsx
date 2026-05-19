"use client";

import Image from "next/image";

import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

export function IdeaLoader({
  title = "Analyzing your idea...",
  description = "Preparing your AI workspace",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-10 backdrop-blur-md">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-300/20 bg-cyan-400/5 shadow-[0_0_32px_rgba(34,211,238,0.12)]" />
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
          <Image
            src={imageWithVersion(TEAM_VORTEX_ICON)}
            alt="TEAM VORTEX"
            width={52}
            height={52}
            priority
            className="relative h-12 w-12 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.28)]"
          />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.28em] text-cyan-300">{title}</p>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
