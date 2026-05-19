"use client";

import { InnovationUniverse } from "@/components/InnovationUniverse";
import { PageShell } from "@/components/layout/page-shell";
import { TEAM_VORTEX_BANNER, imageWithVersion } from "@/lib/branding";
export default function InnovationUniversePage() {
  return (
    <PageShell
      title="Innovation Universe"
      description="Exploring ideas by Team_Vortex"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={imageWithVersion(TEAM_VORTEX_BANNER)} alt="Team Vortex" className="hero-banner h-20 sm:h-24" />
          <p className="team-vortex-text text-xs uppercase tracking-[0.3em] text-slate-300">
            Exploring Ideas by TEAM_VORTEX
          </p>
        </div>
        <InnovationUniverse />
      </div>
    </PageShell>
  );
}

