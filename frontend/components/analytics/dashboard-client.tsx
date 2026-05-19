"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BrainCircuit,
  CircleDollarSign,
  Compass,
  Landmark,
  MapPinned,
  Search,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";

import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { useActiveIdea } from "@/hooks/use-active-idea";
import { readCurrentIdeaContext, type CurrentIdeaContext } from "@/services/current-idea";
import { buildInvestorSummary } from "@/lib/module-insights";
import { AnalyzeIdeaResponse } from "@/types/api";
import { TiltCard } from "@/components/TiltCard";

type SectionKey = "idea" | "location" | "competition" | "financial" | "funding" | "growth";

type DashboardModule = {
  key: SectionKey;
  title: string;
  caption: string;
  icon: ReactNode;
  href: string;
};

type ChartDatum = { name: string; value: number };
const DashboardRealtimeSurface = dynamic(
  () => import("@/components/analytics/dashboard-realtime-surface").then((mod) => mod.DashboardRealtimeSurface),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md">
        <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-28 rounded-[24px]" />
            ))}
          </div>
          <div className="rounded-[26px] border border-white/10 bg-[#020617]/45 p-5">
            <div className="skeleton-shimmer h-[300px] rounded-[24px]" />
          </div>
        </div>
      </div>
    ),
  },
);

const MODULES: DashboardModule[] = [
  { key: "idea", title: "Idea", caption: "Score, risk, audience", icon: <BrainCircuit className="h-5 w-5" />, href: "/analysis" },
  { key: "location", title: "Location", caption: "Profit zones, city fit", icon: <MapPinned className="h-5 w-5" />, href: "/location" },
  { key: "competition", title: "Competition", caption: "Density, saturation", icon: <Search className="h-5 w-5" />, href: "/similar" },
  { key: "financial", title: "Financial", caption: "Revenue, ROI, costs", icon: <CircleDollarSign className="h-5 w-5" />, href: "/investor" },
  { key: "funding", title: "Funding", caption: "Capital, readiness", icon: <Landmark className="h-5 w-5" />, href: "/investor" },
  { key: "growth", title: "Growth", caption: "Scale and expansion", icon: <TrendingUp className="h-5 w-5" />, href: "/market" },
];

export function DashboardClient() {
  const { analysis, idea, loading, error, authRequired } = useActiveIdea();
  const [activeSection, setActiveSection] = useState<SectionKey>("idea");
  const [context, setContext] = useState<CurrentIdeaContext | null>(null);
  const [readyStage, setReadyStage] = useState(0);
  const liveTick = useLiveTick(readyStage >= 3);

  useEffect(() => {
    setContext(readCurrentIdeaContext());
  }, [idea?.id]);

  useEffect(() => {
    setReadyStage(0);
    const timers = [
      window.setTimeout(() => setReadyStage(1), 120),
      window.setTimeout(() => setReadyStage(2), 360),
      window.setTimeout(() => setReadyStage(3), 620),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [idea?.id]);

  const investor = useMemo(() => (analysis ? buildInvestorSummary(analysis) : null), [analysis]);

  if (authRequired) return <AuthRequiredState title="Sign in to open your dashboard" />;

  if (loading) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Preparing visual dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;

  if (!analysis || !idea || !investor) {
    return (
      <EmptyIdeaState
        title="Create your first business ecosystem"
        description="Run an analysis to unlock visual insights for idea, location, competition, finance, funding, and growth."
      />
    );
  }

  const ideaType = analysis.idea_type ?? (analysis.mode === "business" || idea.mode === "business" ? "business" : "startup");
  const isBusinessIdea = ideaType === "business";
  const business = analysis.business_analysis ?? {};
  const overallScore = Math.round(Number(isBusinessIdea ? business.business_viability_score ?? analysis.innovation_score : analysis.innovation_score));
  const riskScore = riskToScore(String(isBusinessIdea ? business.risk_level ?? analysis.future_impact.risk_level : analysis.future_impact.risk_level));
  const profitScore = Math.round(Number(business.profit_potential ?? analysis.startup_analysis.startup_potential_score ?? analysis.innovation_score));
  const recommendation = String(
    isBusinessIdea
      ? business.recommendation ?? "Validate demand in the best location before investing heavily."
      : "Validate traction and sharpen differentiation before scaling.",
  );
  const modules = MODULES;
  const liveOverallScore = applyLiveDrift(overallScore, liveTick, 1, 2);
  const liveRiskScore = applyLiveDrift(riskScore, liveTick, 2, 2);
  const liveProfitScore = applyLiveDrift(profitScore, liveTick, 3, 3);
  const insights = useMemo(
    () =>
      buildLiveInsights({
        activeSection,
        demand: Math.round(Number(business.demand_estimation ?? analysis.market_insights.growth_forecast_cagr * 4)),
        competition: Math.round(Number(business.competition_level ?? analysis.similarity_score)),
        profit: liveProfitScore,
        city: context?.location?.city,
        tick: liveTick,
      }),
    [activeSection, analysis.market_insights.growth_forecast_cagr, analysis.similarity_score, business.competition_level, business.demand_estimation, context?.location?.city, liveProfitScore, liveTick],
  );
  const alertMessage = useMemo(() => buildSmartAlert(insights[0], liveTick), [insights, liveTick]);
  const microSignals = useMemo(() => buildMicroSignals(activeSection, liveTick, insights), [activeSection, insights, liveTick]);

  const moduleData = useMemo(
    () => buildModuleData(activeSection, analysis, investor, isBusinessIdea, context?.location),
    [activeSection, analysis, context?.location, investor, isBusinessIdea],
  );
  const panelSignal = useMemo(() => buildMicroSignals(activeSection, liveTick, [moduleData.summary]).panel, [activeSection, liveTick, moduleData.summary]);
  const topSimilarTitle = analysis.top_similar_projects[0]?.title;
  const breakEvenTime = business.break_even_time ?? "12-18 months";

  return (
    <div className="relative space-y-7">
      <section
        className={clsx(
          "relative grid gap-5 rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(2,6,23,0.42)] backdrop-blur-xl transition-all duration-500 lg:grid-cols-[0.82fr_1.55fr]",
          readyStage >= 1 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <CircularMetric label="Overall" value={liveOverallScore} tone="cyan" trend={getTrend(overallScore, liveTick, 1)} />
          <CircularMetric label="Risk" value={liveRiskScore} tone={liveRiskScore >= 70 ? "emerald" : liveRiskScore >= 45 ? "amber" : "red"} trend={getTrend(riskScore, liveTick, 2)} />
          <CircularMetric label={isBusinessIdea ? "Profit" : "Traction"} value={liveProfitScore} tone="emerald" trend={getTrend(profitScore, liveTick, 3)} />
        </div>

        <div className="relative overflow-hidden rounded-[26px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,47,73,0.72),rgba(15,23,42,0.92))] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_18%_90%,rgba(168,85,247,0.10),transparent_24%)]" />
          <FloatingInsight className="right-4 top-4 hidden xl:flex" text={microSignals.hero} />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">AI recommendation</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
                Live model
              </span>
            </div>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white xl:text-[2.15rem]">{idea.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 xl:text-[15px]">{shorten(recommendation, 170)}</p>
          </div>
          <div className="relative mt-6 grid gap-3 md:grid-cols-3">
            <MiniAction title="Start" value={isBusinessIdea ? context?.location?.city ?? "Best zone" : "User interviews"} emphasis="primary" />
            <MiniAction title="Avoid" value={isBusinessIdea ? "High-rent red zones" : "Broad pitching"} />
            <MiniAction title="Next" value={isBusinessIdea ? "Open Location" : "Open Analysis"} />
          </div>
        </div>
      </section>

      <section
        className={clsx(
          "rounded-[30px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl transition-all duration-500",
          readyStage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {modules.map((item) => (
            <TiltCard
              key={item.key}
              as="button"
              onClick={() => setActiveSection(item.key)}
              className={clsx(
                "group rounded-[24px] border p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_44px_rgba(34,211,238,0.08)]",
                activeSection === item.key
                  ? "border-cyan-300/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(59,130,246,0.08),rgba(15,23,42,0.82))] shadow-[0_0_28px_rgba(34,211,238,0.16)]"
                  : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]",
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-cyan-300 transition group-hover:scale-105">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.caption}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <DashboardRealtimeSurface
        activeSection={activeSection}
        cards={moduleData.cards.map((card) => ({ title: card.title, value: card.value, caption: card.caption }))}
        title={moduleData.title}
        summary={moduleData.summary}
        chartData={moduleData.chartData}
        href={modules.find((item) => item.key === activeSection)?.href ?? "/analysis"}
        isReady={readyStage >= 3}
        liveTick={liveTick}
        locationCity={context?.location?.city}
        topSimilarTitle={topSimilarTitle}
        breakEvenTime={activeSection === "financial" ? breakEvenTime : undefined}
        panelSignal={panelSignal}
        insights={insights}
        alertMessage={alertMessage}
      />
    </div>
  );
}

function buildModuleData(
  section: SectionKey,
  analysis: AnalyzeIdeaResponse,
  investor: ReturnType<typeof buildInvestorSummary>,
  isBusinessIdea: boolean,
  location?: CurrentIdeaContext["location"],
) {
  const business = analysis.business_analysis ?? {};
  const score = Math.round(Number(isBusinessIdea ? business.business_viability_score ?? analysis.innovation_score : analysis.innovation_score));
  const competition = Math.round(Number(business.competition_level ?? analysis.similarity_score));
  const demand = Math.round(Number(business.demand_estimation ?? analysis.market_insights.growth_forecast_cagr * 4));
  const profit = Math.round(Number(business.profit_potential ?? analysis.startup_analysis.startup_potential_score ?? score));

  if (section === "location") {
    return {
      title: "Location Intelligence",
      summary: `${location?.city ?? "City"} opportunity map`,
      cards: [
        { title: "City", value: location?.city ?? "Select city", caption: location?.state ?? "Location context", icon: <MapPinned className="h-4 w-4" /> },
        { title: "Suitability", value: `${business.location_suitability ?? 70}/100`, caption: "Launch zone fit", icon: <Compass className="h-4 w-4" /> },
        { title: "Best Zones", value: "Green", caption: "Higher profit pockets", icon: <TrendingUp className="h-4 w-4" /> },
        { title: "Avoid", value: "Red", caption: "Crowded areas", icon: <Search className="h-4 w-4" /> },
      ],
      chartData: [],
    };
  }

  if (section === "competition") {
    return {
      title: "Competition Analysis",
      summary: competition >= 70 ? "High saturation" : "Moderate saturation",
      cards: [
        { title: "Density", value: `${competition}/100`, caption: "Market pressure", icon: <Search className="h-4 w-4" /> },
        { title: "Similarity", value: `${Math.round(analysis.similarity_score)}%`, caption: "Comparable overlap", icon: <BrainCircuit className="h-4 w-4" /> },
        { title: "Position", value: competition >= 70 ? "Crowded" : "Open", caption: "Differentiation need", icon: <Compass className="h-4 w-4" /> },
        { title: "Action", value: "Niche", caption: "Focus your wedge", icon: <TrendingUp className="h-4 w-4" /> },
      ],
      chartData: [
        { name: "Density", value: competition },
        { name: "Overlap", value: Math.round(analysis.similarity_score) },
        { name: "Risk", value: 100 - riskToScore(analysis.future_impact.risk_level) },
      ],
    };
  }

  if (section === "financial") {
    return {
      title: "Financial Insights",
      summary: business.break_even_time ?? "Projected economics",
      cards: [
        { title: "Investment", value: String(business.initial_investment ?? business.cost_estimation ?? "$25K"), caption: "Initial setup", icon: <CircleDollarSign className="h-4 w-4" /> },
        { title: "Revenue", value: String(business.expected_revenue ?? "$58K/year"), caption: "Expected annual", icon: <TrendingUp className="h-4 w-4" /> },
        { title: "Profit", value: `${profit}/100`, caption: "Potential score", icon: <Compass className="h-4 w-4" /> },
        { title: "ROI", value: `${Math.max(18, profit - 22)}%`, caption: "Estimated range", icon: <Landmark className="h-4 w-4" /> },
      ],
      chartData: [
        { name: "Investment", value: 38 },
        { name: "Revenue", value: 62 },
        { name: "Margin", value: Math.max(20, profit) },
      ],
    };
  }

  if (section === "funding") {
    return {
      title: "Funding Strategy",
      summary: isBusinessIdea ? "Loan or bootstrap first" : investor.decision,
      cards: [
        { title: "Readiness", value: `${isBusinessIdea ? score : investor.fundingProbability}/100`, caption: "Pitch signal", icon: <Landmark className="h-4 w-4" /> },
        { title: "Capital", value: String(business.initial_investment ?? "MVP scope"), caption: "Required amount", icon: <CircleDollarSign className="h-4 w-4" /> },
        { title: "Path", value: isBusinessIdea ? "Loan" : "VC", caption: "Suggested funding", icon: <TrendingUp className="h-4 w-4" /> },
        { title: "Proof", value: "Traction", caption: "Before scaling", icon: <Search className="h-4 w-4" /> },
      ],
      chartData: [
        { name: "Ready", value: isBusinessIdea ? score : investor.fundingProbability },
        { name: "Gap", value: Math.max(0, 100 - (isBusinessIdea ? score : investor.fundingProbability)) },
      ],
    };
  }

  if (section === "growth") {
    return {
      title: "Growth Potential",
      summary: "Expansion readiness",
      cards: [
        { title: "Growth", value: `${business.growth_potential ?? demand}/100`, caption: "Potential score", icon: <TrendingUp className="h-4 w-4" /> },
        { title: "Market", value: `${analysis.market_insights.growth_forecast_cagr.toFixed(1)}%`, caption: "CAGR signal", icon: <Compass className="h-4 w-4" /> },
        { title: "Next", value: analysis.market_insights.best_countries_for_launch[0] ?? "TBD", caption: "Expansion market", icon: <MapPinned className="h-4 w-4" /> },
        { title: "Scale", value: `${analysis.startup_analysis.startup_potential_score ?? score}/100`, caption: "Readiness", icon: <BrainCircuit className="h-4 w-4" /> },
      ],
      chartData: analysis.market_insights.yearly_projection.map((item) => ({
        name: String(item.year ?? ""),
        value: Number(item.projection ?? item.market_index ?? 0),
      })),
    };
  }

  return {
    title: "Idea Analysis",
    summary: isBusinessIdea ? "Business viability" : "Startup readiness",
    cards: [
      { title: "Score", value: `${score}/100`, caption: isBusinessIdea ? "Viability" : "Innovation", icon: <BrainCircuit className="h-4 w-4" /> },
      { title: "Demand", value: `${demand}/100`, caption: "Market pull", icon: <Compass className="h-4 w-4" /> },
      { title: "Risk", value: analysis.future_impact.risk_level, caption: "Current level", icon: <Search className="h-4 w-4" /> },
      { title: "Users", value: String(analysis.idea_profile.target_users[0] ?? "Target users"), caption: "Primary segment", icon: <MapPinned className="h-4 w-4" /> },
    ],
    chartData: [
      { name: "Score", value: score },
      { name: "Demand", value: demand },
      { name: "Profit", value: profit },
      { name: "Risk", value: riskToScore(analysis.future_impact.risk_level) },
    ],
  };
}

function InsightCard({
  title,
  value,
  caption,
  icon,
  index,
  trend,
  featured,
}: {
  title: string;
  value: string;
  caption: string;
  icon: ReactNode;
  index: number;
  trend: TrendState;
  featured?: boolean;
}) {
  return (
    <TiltCard
      className={clsx(
        "animate-dashboard-card group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.06] hover:shadow-[0_18px_48px_rgba(34,211,238,0.10)]",
        featured && "sm:col-span-2 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,47,73,0.64))]",
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">{icon}</div>
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-2 line-clamp-1 text-2xl font-black text-white">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{caption}</p>
        <PredictiveBadge trend={trend} />
      </div>
    </TiltCard>
  );
}

function CircularMetric({ label, value, tone, trend }: { label: string; value: number; tone: "cyan" | "emerald" | "amber" | "red"; trend: TrendState }) {
  const color = tone === "emerald" ? "#22c55e" : tone === "amber" ? "#f59e0b" : tone === "red" ? "#ef4444" : "#22d3ee";
  const safeValue = Math.max(0, Math.min(100, value));
  const animatedValue = useCountUp(safeValue, 1050);

  return (
    <TiltCard className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(34,211,238,0.08)]">
      <div
        className="grid h-20 w-20 shrink-0 place-items-center rounded-full transition-all duration-700"
        style={{ background: `conic-gradient(${color} ${animatedValue * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#020617] text-sm font-black text-white">{animatedValue}</div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-300">Score</p>
        <div className="mt-2">
          <PredictiveBadge trend={trend} />
        </div>
      </div>
    </TiltCard>
  );
}

function MiniAction({ title, value, emphasis }: { title: string; value: string; emphasis?: "primary" }) {
  return (
    <TiltCard
      className={clsx(
        "rounded-2xl border border-white/10 bg-[#020617]/35 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:shadow-[0_14px_36px_rgba(34,211,238,0.08)]",
        emphasis === "primary" && "border-cyan-300/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(15,23,42,0.84))]",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-2 line-clamp-1 text-sm font-bold text-white">{value}</p>
    </TiltCard>
  );
}

type TrendState = "up" | "down" | "stable";

function PredictiveBadge({ trend }: { trend: TrendState }) {
  const label = trend === "up" ? "Trending Up" : trend === "down" ? "Declining" : "Stable";
  const className =
    trend === "up"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : trend === "down"
        ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
        : "border-slate-300/15 bg-white/[0.04] text-slate-300";

  return <span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${className}`}>{label}</span>;
}


function useLiveTick(enabled: boolean) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setInterval(() => {
      setTick((current) => (current + 1) % 1000);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [enabled]);

  return tick;
}

function useCountUp(value: number, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const target = Math.max(0, Math.min(100, Math.round(value)));

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return displayValue;
}

function applyLiveDrift(value: number, tick: number, seed: number, range = 2) {
  const base = Number.isFinite(value) ? value : 0;
  const wave = Math.sin((tick + seed) * 0.72) * range + Math.cos((tick + seed) * 0.31) * (range / 2);
  return Math.max(0, Math.min(100, Math.round(base + wave)));
}

function getTrend(value: number, tick: number, seed: number): TrendState {
  const current = applyLiveDrift(value, tick, seed);
  const previous = applyLiveDrift(value, Math.max(0, tick - 1), seed);
  const delta = current - previous;

  if (delta >= 2) return "up";
  if (delta <= -2) return "down";
  return "stable";
}

function extractScore(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 50;
}

function buildLiveInsights({
  activeSection,
  demand,
  competition,
  profit,
  city,
  tick,
}: {
  activeSection: SectionKey;
  demand: number;
  competition: number;
  profit: number;
  city?: string;
  tick: number;
}) {
  const liveDemand = applyLiveDrift(demand, tick, 8, 3);
  const liveCompetition = applyLiveDrift(competition, tick, 11, 2);
  const zone = city ? `${city} Zone ${String.fromCharCode(65 + (tick % 3))}` : `Zone ${String.fromCharCode(65 + (tick % 3))}`;
  const opportunity = profit >= 70 ? "high opportunity" : profit >= 45 ? "moderate opportunity" : "cautious opportunity";

  const sectionInsight =
    activeSection === "location"
      ? `Best opportunity detected in ${zone}; profit signal is ${opportunity}.`
      : activeSection === "competition"
        ? `Competition is ${liveCompetition >= 70 ? "rising" : "controlled"}; differentiation remains the strongest lever.`
        : activeSection === "financial"
          ? `Financial model is stable; protect margin before increasing acquisition spend.`
          : activeSection === "funding"
            ? `Funding readiness improves when traction evidence is attached to the current pitch.`
            : activeSection === "growth"
              ? `Growth trend is strongest when expansion follows demand clusters instead of broad rollout.`
              : `Demand score is tracking near ${liveDemand}/100 with a ${opportunity} signal.`;

  return [
    sectionInsight,
    `Demand is ${getTrend(demand, tick, 8) === "up" ? "increasing" : getTrend(demand, tick, 8) === "down" ? "cooling slightly" : "stable"} around ${liveDemand}/100.`,
    `Competition signal is ${liveCompetition}/100; monitor saturation before scaling spend.`,
  ];
}

function buildSmartAlert(primaryInsight: string | undefined, tick: number) {
  if (!primaryInsight) return "";
  if (tick % 3 === 0) return `High opportunity detected: ${primaryInsight}`;
  if (tick % 3 === 1) return "Market saturation check updated; review competition before scaling.";
  return "Predictive model refreshed with the latest dashboard signals.";
}

function buildMicroSignals(section: SectionKey, tick: number, insights: string[]) {
  const rotating = [
    "Analyzing demand...",
    "Competition rising...",
    "Opportunity detected",
    "Risk profile stable",
  ];

  return {
    hero: rotating[tick % rotating.length],
    panel: section === "location" ? "Zone confidence updating" : insights[0] ?? rotating[(tick + 1) % rotating.length],
  };
}

function FloatingInsight({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute z-10 items-center gap-2 rounded-full border border-cyan-300/15 bg-[#020617]/72 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 shadow-[0_12px_24px_rgba(2,6,23,0.32)] backdrop-blur-xl animate-dashboard-float",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
      {text}
    </div>
  );
}

function riskToScore(risk: string) {
  const normalized = risk.toLowerCase();
  if (normalized.includes("low")) return 84;
  if (normalized.includes("high")) return 32;
  return 58;
}

function shorten(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}
