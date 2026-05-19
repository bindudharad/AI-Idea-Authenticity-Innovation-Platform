"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

export function LoadingScreen({ visible }: { visible: boolean }) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const interval = window.setInterval(() => {
      setDots((count) => (count >= 3 ? 1 : count + 1));
    }, 500);

    return () => window.clearInterval(interval);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_center,#06142a,#020611)]">
      <div className="ai-loader">
        <div className="ai-ring" />
        <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" width={96} height={96} className="ai-logo" priority />
      </div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
        Initializing AI Innovation Engine{".".repeat(dots)}
      </p>
    </div>
  );
}
