"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, ShieldEllipsis, Sparkles, Trophy } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { Button } from "@/ui/button";
import { TEAM_VORTEX_HERO, imageWithVersion } from "@/lib/branding";

const Particles = dynamic(() => import("react-tsparticles"), { ssr: false });

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const hasPlus = value.includes("+");
  const hasPercent = value.includes("%");
  const hasK = value.includes("K");
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (hasK) {
      return (latest / 1000).toFixed(1) + "K";
    }
    if (hasPercent) {
      return Math.round(latest) + "%";
    }
    return Math.round(latest).toLocaleString() + (hasPlus ? "+" : "");
  });

  useEffect(() => {
    const controls = animate(count, numericValue, {
      duration: 2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, numericValue]);

  return <motion.span>{rounded}</motion.span>;
}

const stats = [
  { label: "Ideas screened", value: "142000", display: "142K+" },
  { label: "Hackathon teams", value: "6300", display: "6.3K" },
  { label: "Avg. innovation uplift", value: "28", display: "+28%" },
];

export function HeroSection() {
  return (
    <section className="section-shell pt-10 sm:pt-16">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative glass-card overflow-hidden bg-hero-gradient p-8 sm:p-12"
      >
        <div className="absolute inset-0">
          <Particles
            options={{
              fullScreen: false,
              particles: {
                number: { value: 40, density: { enable: true, area: 800 } },
                color: { value: ["#5ec5ff", "#9b87ff"] },
                opacity: { value: 0.35 },
                size: { value: { min: 1, max: 3 } },
                move: { enable: true, speed: 0.4 },
              },
              interactivity: {
                events: { onHover: { enable: true, mode: "repulse" } },
                modes: { repulse: { distance: 90 } },
              },
            }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
            >
              <Sparkles className="h-4 w-4 text-glow" />
              Idea Authenticity Intelligence
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl"
            >
              AI Innovation Intelligence Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-4 max-w-2xl text-base leading-8 text-slate-300"
            >
              Verify originality. Discover innovation. Build the future.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 flex flex-col items-start gap-4"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                className="rounded-3xl border border-white/10 bg-white/5 p-3"
              >
                <img
                  src={imageWithVersion(TEAM_VORTEX_HERO)}
                  alt="Team Vortex"
                  className="team-hero-image"
                />
              </motion.div>
              <p className="team-vortex-text text-xs uppercase tracking-[0.32em] text-slate-300">
                Powered by TEAM_VORTEX
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button href="/analyze" className="gap-2 hover:shadow-[0_0_22px_rgba(82,199,255,0.6)]">
                Analyze Idea
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/dashboard" variant="secondary" className="hover:shadow-[0_0_18px_rgba(138,92,246,0.5)]">
                Explore Innovation
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="rounded-3xl border border-white/10 bg-black/15 p-5"
                >
                  <p className="stat-value">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-[28px] border border-white/10 bg-black/20 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-glow/15 p-3 text-glow">
                  <ShieldEllipsis className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Ownership Certificates</p>
                  <p className="text-sm text-slate-400">Timestamped PDF proof for private submissions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Trophy className="h-5 w-5 text-solar" />
                <p className="text-sm text-slate-300">
                  Simulated judge scoring combines originality, technical complexity, and real-world impact.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
