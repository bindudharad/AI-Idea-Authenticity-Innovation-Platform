"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { RouteTransition } from "@/components/layout/route-transition";
import { Sidebar } from "@/components/layout/sidebar";
import StartupAnimationWrapper from "@/components/layout/startup-animation-wrapper";

const AssistantPanel = dynamic(() => import("@/components/assistant/AssistantPanel").then((mod) => mod.AssistantPanel), {
  ssr: false,
});
const AudioInteractionLayer = dynamic(
  () => import("@/components/audio/audio-interaction-layer").then((mod) => mod.AudioInteractionLayer),
  { ssr: false },
);
const GlowCursor = dynamic(() => import("@/components/GlowCursor").then((mod) => mod.GlowCursor), { ssr: false });
const ParallaxDepthLayers = dynamic(
  () => import("@/components/motion/parallax-depth-layers").then((mod) => mod.ParallaxDepthLayers),
  { ssr: false },
);
const ParticleBackground = dynamic(() => import("@/components/ParticleBackground").then((mod) => mod.ParticleBackground), { ssr: false });

export function AppLayoutShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <StartupAnimationWrapper>
      <div className="premium-shell min-h-screen selection:bg-cyan-500/30">
        {mounted ? <ParallaxDepthLayers /> : null}
        {mounted ? <ParticleBackground /> : null}
        {mounted ? <GlowCursor /> : null}

        <div className="app-layout relative z-[2] bg-transparent">
          <Sidebar />

          <div className="main-area min-w-0">
            <Navbar />

            <main className="content">
              <div className="w-full max-w-none px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                <RouteTransition>{children}</RouteTransition>
              </div>

              <footer className="px-5 py-12 sm:px-8 lg:px-10">
                <div className="glass-card mx-auto flex max-w-7xl flex-col gap-6 rounded-[28px] border border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.55)]" />
                      TEAM_VORTEX
                    </div>
                    <p className="mt-3 text-sm text-slate-400">AI Innovation Intelligence Platform for smarter business decisions.</p>
                    <p className="mt-2 text-xs text-slate-500">Built for the next generation of AI-powered founders. v1.0 AI Engine</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                    <Link href="/" className="footer-link">
                      Home
                    </Link>
                    <Link href="/analysis" className="footer-link">
                      Analysis
                    </Link>
                    <Link href="/market" className="footer-link">
                      Market
                    </Link>
                    <Link href="/location" className="footer-link">
                      Location
                    </Link>
                    <Link href="/investor" className="footer-link">
                      Funding
                    </Link>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>

        {mounted ? <AssistantPanel /> : null}
        {mounted ? <AudioInteractionLayer /> : null}
      </div>
    </StartupAnimationWrapper>
  );
}
