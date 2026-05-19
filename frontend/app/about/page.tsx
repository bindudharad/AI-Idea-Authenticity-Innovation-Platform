"use client";

import { motion } from "framer-motion";

import { PageShell } from "@/components/layout/page-shell";
import { TEAM_VORTEX_BANNER, TEAM_VORTEX_ICON, TEAM_VORTEX_NAVBAR, imageWithVersion } from "@/lib/branding";
import { Card } from "@/ui/card";

export default function AboutPage() {
  return (
    <PageShell
      title="About"
      description="Mission, technology stack, and the AI architecture powering the innovation intelligence platform."
    >
      <Card>
        <p className="panel-heading">TEAM_VORTEX</p>
        <h2 className="panel-subtitle">The team behind the innovation intelligence platform</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
          <motion.div
            initial={false}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="image-card rounded-[28px] border border-white/10 p-6"
          >
            <div className="flex flex-col items-center gap-4">
              <img src={imageWithVersion(TEAM_VORTEX_BANNER)} alt="Team Vortex" className="team-image h-20 sm:h-24" />
              <img src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex icon" className="h-24 w-24 object-contain" />
            </div>
          </motion.div>
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              Team_Vortex is a multidisciplinary innovation team focused on building AI systems that help founders,
              students, and researchers validate ideas faster. We blend semantic search, agentic reasoning, and
              product design to create a platform that feels like a mission-control dashboard for new ventures.
            </p>
            <p>
              The platform combines Groq-powered reasoning, Hugging Face embeddings, and global data sources to
              deliver actionable innovation intelligence, transparency, and defensible originality.
            </p>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">TEAM_VORTEX Brand System</p>
              <img src={imageWithVersion(TEAM_VORTEX_NAVBAR)} alt="Team Vortex navbar banner" className="mt-3 w-full rounded-2xl object-contain" />
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
