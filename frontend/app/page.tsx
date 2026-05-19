"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  LineChart,
  MapPinned,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { imageWithVersion, TEAM_VORTEX_ICON } from "@/lib/branding";
import { buildApiRootUrl, getApiRootUrl } from "@/services/api";
import { Button } from "@/ui/button";

const RevealOnScroll = dynamic(() => import("@/components/motion/reveal-on-scroll").then((mod) => mod.RevealOnScroll), {
  ssr: false,
});
const TiltCard = dynamic(() => import("@/components/TiltCard").then((mod) => mod.TiltCard), {
  ssr: false,
});
const TeamSection = dynamic(() => import("@/components/home/TeamSection").then((mod) => mod.TeamSection), {
  loading: () => (
    <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Meet our team</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">TEAM_VORTEX</h2>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div className="h-[220px] animate-pulse rounded-[22px] bg-white/5" />
          </div>
        ))}
      </div>
    </section>
  ),
});

const liveMessages = [
  "Analyzing demand patterns...",
  "Evaluating competition...",
  "Scoring investor fit...",
  "Generating insights...",
];

const productStats = [
  { label: "Decision modules", value: "6", detail: "idea, market, location, finance, funding, growth" },
  { label: "Zone scoring", value: "30", detail: "profit heatmap cells per selected city" },
  { label: "Analysis flow", value: "4 steps", detail: "type, idea, location, AI recommendation" },
];

const liveSignals = [
  { label: "Overall Score", value: "86%", width: 86, tone: "cyan" as const, badge: "High" as const },
  { label: "Market Demand", value: "High", width: 78, tone: "emerald" as const, badge: "High" as const },
  { label: "Competition Risk", value: "Medium", width: 54, tone: "amber" as const, badge: "Medium" as const },
  { label: "Investor Fit", value: "Promising", width: 72, tone: "blue" as const, badge: "High" as const },
  { label: "Growth Potential", value: "Strong", width: 82, tone: "violet" as const, badge: "High" as const },
];

const kpis = [
  { label: "Ideas analyzed", value: 12450, suffix: "+", icon: BrainCircuit },
  { label: "Markets covered", value: 85, suffix: "+", icon: Compass },
  { label: "Success score", value: 78, suffix: "%", icon: TrendingUp },
  { label: "Funding matches", value: 2100, suffix: "+", icon: CircleDollarSign },
];

const capabilities = [
  {
    title: "Idea Intelligence",
    description: "Analyze originality, feasibility, target users, risks, and improvement paths in one clean workspace.",
    icon: BrainCircuit,
    href: "/analysis",
  },
  {
    title: "Market Strategy",
    description: "Understand market size, competition pressure, launch countries, and location-level opportunity.",
    icon: Compass,
    href: "/market",
  },
  {
    title: "Location Intelligence",
    description: "Choose a city and reveal green profit zones, red competition zones, and launch recommendations.",
    icon: MapPinned,
    href: "/location",
  },
  {
    title: "Funding Chances",
    description: "Evaluate investor readiness, strategic strengths, weaknesses, and funding probability.",
    icon: CircleDollarSign,
    href: "/investor",
  },
];

const workflow = [
  {
    title: "Choose Startup",
    description: "Select the business path you want to validate first.",
    icon: Sparkles,
  },
  {
    title: "Enter Idea & Location",
    description: "Add the concept, target market, and launch geography.",
    icon: MapPinned,
  },
  {
    title: "Run AI Analysis",
    description: "Generate scores, signals, competition, and market intelligence.",
    icon: Radar,
  },
  {
    title: "Get Insights",
    description: "Open the exact recommendations you need to move next.",
    icon: LineChart,
  },
];

const flowNodes = [
  { label: "Idea Input", icon: Sparkles },
  { label: "AI Engine", icon: BrainCircuit },
  { label: "Market Data", icon: Compass },
  { label: "Risk Analysis", icon: Radar },
  { label: "Final Decision", icon: CheckCircle2 },
];

const reasons = [
  {
    title: "AI-Driven Insights",
    description: "Every module converts your idea into clear, usable signals instead of generic output.",
    icon: BrainCircuit,
  },
  {
    title: "Market-Backed Decisions",
    description: "Location, competition, and demand data are fused into one decision system.",
    icon: Compass,
  },
  {
    title: "Investor Readiness",
    description: "Show traction, opportunity, and risk in the language investors expect.",
    icon: CircleDollarSign,
  },
];

const testimonials = [
  {
    quote: "Reduced our market risk by 40%",
    author: "Startup Founder",
  },
  {
    quote: "Helped us validate our idea in minutes",
    author: "Product Team",
  },
  {
    quote: "Best AI tool for early-stage decisions",
    author: "Indie Builder",
  },
];

const demoResult = {
  score: 82,
  demand: "High",
  risk: "Medium",
  recommendation: "Strong opportunity in Tier-2 cities",
};

export default function LandingPage() {
  const [liveMessageIndex, setLiveMessageIndex] = useState(0);
  const [demoIdea, setDemoIdea] = useState("");
  const [demoState, setDemoState] = useState<"idle" | "loading" | "done">("idle");
  const [typedRecommendation, setTypedRecommendation] = useState("");
  const [backendMessage, setBackendMessage] = useState("Checking backend...");
  const demoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const apiUrl = getApiRootUrl();
    const healthUrl = buildApiRootUrl("/");
    console.debug("[API] Using URL:", apiUrl);

    async function checkBackend() {
      try {
        const response = await fetch(healthUrl, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Backend health check failed: ${response.status}`);
        }

        const payload = (await response.json()) as { message?: string };
        console.debug("[API] Response:", payload);
        setBackendMessage(payload.message || "Backend connected");
      } catch (error) {
        console.error("[API] Backend check failed:", error);
        setBackendMessage("Backend not connected");
      }
    }

    void checkBackend();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLiveMessageIndex((current) => (current + 1) % liveMessages.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (demoState !== "done") {
      setTypedRecommendation("");
      return;
    }

    let index = 0;
    const text = demoResult.recommendation;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedRecommendation(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 32);

    return () => window.clearInterval(interval);
  }, [demoState]);

  useEffect(() => {
    return () => {
      if (demoTimerRef.current) {
        window.clearTimeout(demoTimerRef.current);
      }
    };
  }, []);

  const currentLiveMessage = useMemo(() => liveMessages[liveMessageIndex], [liveMessageIndex]);

  const handleAnalyzeDemo = () => {
    if (demoTimerRef.current) {
      window.clearTimeout(demoTimerRef.current);
    }

    setDemoState("loading");
    demoTimerRef.current = window.setTimeout(() => {
      setDemoState("done");
    }, 2000);
  };

  return (
    <main className="relative flex-1 overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
        <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-[130px]" />
        <div className="light-beam absolute left-[12%] top-0 h-[460px] w-[260px] -rotate-[16deg] rounded-full bg-cyan-300/10 blur-[90px]" />

        <RevealOnScroll>
          <div className="hero-card glass-card holographic-panel glass-reflection premium-border relative overflow-hidden rounded-[36px] px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(59,130,246,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

            <div className="relative grid gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300 shadow-[0_0_26px_rgba(34,211,238,0.12)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Real business intelligence for builders
                </div>

                <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.02]">
                  AI-Powered Business Intelligence Platform
                </h1>

                <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Validate ideas, analyze markets, choose the best location, and build profitable businesses using AI.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button href="/analyze" className="primary-btn h-12 px-6 font-black">
                    Start Analysis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button href="/analyze?demo=business" variant="secondary" className="h-12 px-6 font-bold">
                    Try Demo Idea
                  </Button>
                </div>

                <div className="mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <span className={`h-2.5 w-2.5 rounded-full ${backendMessage === "Backend not connected" ? "bg-red-400" : "bg-emerald-400"}`} />
                  <span className="truncate">{backendMessage}</span>
                </div>

                <div className="mt-9 grid gap-3 sm:grid-cols-3">
                  {productStats.map((stat, index) => (
                    <TiltCard
                      key={stat.label}
                      className={`premium-card holographic-panel glass-reflection min-h-[138px] rounded-[24px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${index === 0 ? "floating" : ""}`}
                    >
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">{stat.label}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">{stat.detail}</p>
                    </TiltCard>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-[90px]" />
                <div className="pointer-events-none absolute right-4 top-0 z-10 hidden lg:block">
                  <div className="ai-core-orb glass-reflection flex h-28 w-28 items-center justify-center">
                    <Image
                      src={imageWithVersion(TEAM_VORTEX_ICON)}
                      alt="AI system core"
                      width={72}
                      height={72}
                      className="team-vortex-logo h-16 w-16 object-contain opacity-95"
                      priority
                    />
                  </div>
                </div>

                <TiltCard className="live-board-pulse live-glow floating glass-card holographic-panel glass-reflection relative rounded-[32px] p-5 transition-all duration-300 hover:scale-[1.02]">
                  <div className="rounded-[26px] border border-white/10 bg-[#020617]/65 p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-5">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                          <span className="status-dot-live h-2 w-2 rounded-full bg-emerald-400" />
                          Live AI Analysis
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-white">Live Business Signal Board</h2>
                      </div>
                      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
                        <Radar className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 min-h-[28px]">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={currentLiveMessage}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          className="text-sm text-slate-400"
                        >
                          {currentLiveMessage}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {liveSignals.map((signal) => (
                        <SignalRow key={signal.label} {...signal} />
                      ))}
                    </div>

                    <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-5">
                      <div className="flex items-start gap-4">
                        <Bot className="mt-1 h-5 w-5 text-cyan-300" />
                        <div>
                          <p className="text-sm font-bold text-white">AI insight presence</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            Guided intake, live scoring, location intelligence, and recommendations shaped like an operating system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <RevealOnScroll delayMs={80}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Trusted signal layer</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Trusted by early-stage builders</h2>
            </div>
            <p className="text-sm text-slate-400">Decision clarity across ideas, markets, launch zones, and funding paths.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              return (
                <TiltCard
                  key={item.label}
                  className="live-glow premium-card glass-card holographic-panel glass-reflection rounded-[22px] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/15"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-black text-white">
                        <CountUp end={item.value} suffix={item.suffix} />
                      </p>
                    </div>
                    <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <RevealOnScroll delayMs={90}>
          <div className="glass-card holographic-panel glass-reflection premium-border rounded-[32px] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Try AI instantly</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Run a fast idea check in seconds</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Simulate the product flow with a live UI response before you jump into the full workspace.
                </p>
              </div>

              <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                <input
                  value={demoIdea}
                  onChange={(event) => setDemoIdea(event.target.value)}
                  placeholder="Enter your startup idea..."
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300/20 focus:bg-white/[0.055]"
                />
                <Button onClick={handleAnalyzeDemo} className="primary-btn h-12 px-6 font-black">
                  {demoState === "loading" ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {demoState === "loading" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-[26px] border border-cyan-300/12 bg-cyan-400/8 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="status-dot-live h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <p className="text-sm font-medium text-slate-300">Running a fast AI simulation for {demoIdea.trim() || "your idea"}...</p>
                    </div>
                  </motion.div>
                ) : null}

                {demoState === "done" ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[0.8fr_1.2fr]"
                  >
                    <div className="rounded-[22px] border border-white/8 bg-[#020617]/70 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Simulated result</p>
                      <p className="mt-3 text-4xl font-black text-white">{demoResult.score}</p>
                      <p className="mt-2 text-sm text-cyan-300">AI confidence score</p>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                        <p className="text-xs font-semibold text-slate-500">Market Demand</p>
                        <p className="mt-1 text-sm font-bold text-emerald-300">{demoResult.demand}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                        <p className="text-xs font-semibold text-slate-500">Risk</p>
                        <p className="mt-1 text-sm font-bold text-yellow-300">{demoResult.risk}</p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
                        <p className="text-xs font-semibold text-slate-500">Recommendation</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {typedRecommendation}
                          <span className="typing-caret ml-0.5 inline-block h-4 w-[1px] bg-cyan-300 align-middle" />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;

            return (
              <RevealOnScroll key={capability.title} delayMs={80 + index * 40}>
                <TiltCard
                  as="div"
                  className="premium-card card glass-card holographic-panel glass-reflection group min-h-[250px] rounded-[28px] p-6 hover:scale-[1.03] hover:border-cyan-300/20 hover:shadow-[0_28px_90px_rgba(2,6,23,0.5),0_0_34px_rgba(34,211,238,0.12)]"
                >
                  <Link href={capability.href} className="block h-full">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_22px_rgba(34,211,238,0.18)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{capability.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{capability.description}</p>
                    <span className="mt-6 inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                      Open module
                      <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1.5" />
                    </span>
                  </Link>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <RevealOnScroll delayMs={120}>
          <div className="glass-card holographic-panel glass-reflection premium-border grid gap-10 overflow-hidden rounded-[34px] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                  <MapPinned className="h-3.5 w-3.5" />
                  Hero Feature
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">AI Location Profit Intelligence</h2>
                <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                  Pick a country, state, city, and business type to reveal an AI-powered profit heatmap. Green zones show launch opportunities, red zones warn against crowded markets.
                </p>
              </div>

              <Button href="/market" variant="secondary" className="h-12 w-fit border-emerald-300/20 bg-emerald-400/10 px-5 font-bold text-emerald-200 hover:bg-emerald-400/15 hover:text-emerald-100">
                Open Location Intelligence
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            <TiltCard className="premium-card card relative min-h-[340px] overflow-hidden rounded-[28px] border border-white/10 bg-[#020617] p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,197,94,0.18),transparent_26%),radial-gradient(circle_at_78%_70%,rgba(239,68,68,0.14),transparent_24%),linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,48px_48px,48px_48px]" />
              <div className="relative grid h-full grid-cols-6 gap-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const tone = index % 7 === 0 || index % 11 === 0 ? "red" : index % 4 === 0 ? "yellow" : "green";
                  const color =
                    tone === "green"
                      ? "border-emerald-300/30 bg-emerald-400/25 shadow-[0_0_22px_rgba(34,197,94,0.18)]"
                      : tone === "yellow"
                        ? "border-yellow-300/30 bg-yellow-400/25 shadow-[0_0_22px_rgba(234,179,8,0.16)]"
                        : "border-red-300/30 bg-red-400/25 shadow-[0_0_22px_rgba(239,68,68,0.16)]";

                  return <div key={index} className={`animate-zone-pulse min-h-12 rounded-2xl border ${color} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`} />;
                })}
              </div>
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                <MapLegend label="High profit" className="bg-emerald-400" />
                <MapLegend label="Medium" className="bg-yellow-400" />
                <MapLegend label="Avoid first" className="bg-red-400" />
              </div>
            </TiltCard>
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <RevealOnScroll>
            <div className="glass-card holographic-panel glass-reflection rounded-[30px] p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">How it works</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white">Smart Flow</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                The experience is built like an operating system: one clean path from problem framing to action.
              </p>

              <div className="mt-8">
                <div className="grid gap-4 sm:grid-cols-[repeat(5,minmax(0,1fr))]">
                  {flowNodes.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="relative flex flex-col items-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)] transition-transform duration-300 hover:scale-105">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{item.label}</p>
                        {index < flowNodes.length - 1 ? (
                          <div className="absolute left-[calc(50%+1.75rem)] top-5 hidden h-px w-[calc(100%-1rem)] bg-gradient-to-r from-cyan-400/50 via-cyan-300/20 to-transparent sm:block" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="live-glow mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:border-cyan-300/16">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Live Analysis Preview</p>
                      <h3 className="mt-2 text-lg font-bold text-white">System snapshot</h3>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                      <span className="status-dot-live h-2 w-2 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-[#020617]/65 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500">Location</p>
                      <p className="mt-1 text-sm font-bold text-white">Bangalore</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-[#020617]/65 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500">Idea</p>
                      <p className="mt-1 text-sm font-bold text-white">Food Delivery Startup</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-[#020617]/65 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500">Score</p>
                      <p className="mt-1 text-sm font-bold text-emerald-300">82%</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-[#020617]/65 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500">Risk</p>
                      <p className="mt-1 text-sm font-bold text-yellow-300">Medium</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <RevealOnScroll key={item.title} delayMs={index * 70}>
                  <TiltCard className="premium-card card holographic-panel glass-reflection relative rounded-3xl border border-white/10 bg-white/[0.035] p-5 hover:bg-white/[0.055]">
                    {index < workflow.length - 1 ? (
                      <div className="pointer-events-none absolute right-4 top-4 hidden lg:block">
                        <ArrowRight className="h-4 w-4 text-cyan-400/55" />
                      </div>
                    ) : null}
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-300">
                        {index + 1}
                      </span>
                      <Icon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <p className="text-sm font-semibold leading-6 text-white">{item.title}</p>
                    <div className="mt-3 flex items-center gap-3">
                      {index < workflow.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-cyan-400/70" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />}
                      <p className="text-xs leading-6 text-slate-400">{item.description}</p>
                    </div>
                  </TiltCard>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
        <RevealOnScroll delayMs={80}>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Why this platform</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Why Builders Choose This Platform</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {reasons.map((item) => {
              const Icon = item.icon;
              return (
                <TiltCard
                  key={item.title}
                  className="premium-card glass-card holographic-panel glass-reflection rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{item.description}</p>
                </TiltCard>
              );
            })}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
        <RevealOnScroll delayMs={90}>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">What builders say</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Proof that the system feels useful fast</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <TiltCard
                key={item.author}
                className="premium-card glass-card holographic-panel glass-reflection rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/14"
              >
                <p className="text-lg font-semibold leading-8 text-white">"{item.quote}"</p>
                <p className="mt-5 text-sm font-medium text-cyan-300">{item.author}</p>
              </TiltCard>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <TeamSection />

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <RevealOnScroll>
          <div className="glass-card holographic-panel glass-reflection premium-border rounded-[32px] px-6 py-10 text-center sm:px-10 lg:px-14">
            <div className="mx-auto max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Call to action</p>
              <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Start Building Smarter with AI</h2>
              <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                From idea validation to execution - all in one intelligent system.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/analyze" className="primary-btn h-12 px-6 font-black">
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href="/analyze?demo=business" variant="secondary" className="h-12 px-6 font-bold">
                Try Demo
              </Button>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

function SignalRow({
  label,
  value,
  tone,
  width,
  badge,
}: {
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "amber" | "blue" | "violet";
  width: number;
  badge: "High" | "Medium" | "Low";
}) {
  const toneClass = {
    cyan: "from-cyan-400 to-blue-500",
    emerald: "from-emerald-400 to-cyan-400",
    amber: "from-yellow-400 to-orange-400",
    blue: "from-blue-400 to-purple-500",
    violet: "from-violet-400 to-cyan-400",
  }[tone];

  const badgeClass = {
    High: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
    Medium: "border-yellow-300/20 bg-yellow-400/10 text-yellow-200",
    Low: "border-red-300/20 bg-red-400/10 text-red-200",
  }[badge];

  return (
    <div className="live-glow rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs font-black text-white">{value}</p>
          <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeClass}`}>
            {badge}
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className={`holo-progress h-full rounded-full bg-gradient-to-r ${toneClass} shadow-[0_0_16px_rgba(34,211,238,0.24)]`}
        />
      </div>
    </div>
  );
}

function MapLegend({ label, className }: { label: string; className: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-[#020617]/75 px-3 py-2 text-xs text-slate-300 backdrop-blur-xl">
      <span className={`mr-2 inline-block h-2 w-2 rounded-full ${className} shadow-[0_0_10px_currentColor]`} />
      {label}
    </div>
  );
}

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(end * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [end]);

  return (
    <>
      {new Intl.NumberFormat("en-US").format(value)}
      {suffix}
    </>
  );
}


