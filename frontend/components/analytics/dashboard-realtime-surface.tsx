"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import clsx from "clsx";

import { Button } from "@/ui/button";

type SectionKey = "idea" | "location" | "competition" | "financial" | "funding" | "growth";
type ChartDatum = { name: string; value: number };
type TrendState = "up" | "down" | "stable";

type CardDatum = {
  title: string;
  value: string;
  caption: string;
};

type DashboardRealtimeSurfaceProps = {
  activeSection: SectionKey;
  cards: CardDatum[];
  title: string;
  summary: string;
  chartData: ChartDatum[];
  href: string;
  isReady: boolean;
  liveTick: number;
  locationCity?: string;
  topSimilarTitle?: string;
  breakEvenTime?: string;
  panelSignal: string;
  insights: string[];
  alertMessage: string;
};

const chartColors = ["#22d3ee", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444"];

const tooltipStyle = {
  backgroundColor: "rgba(2, 6, 23, 0.94)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "16px",
  color: "#e2e8f0",
  boxShadow: "0 18px 48px rgba(2, 6, 23, 0.45)",
};

export function DashboardRealtimeSurface({
  activeSection,
  cards,
  title,
  summary,
  chartData,
  href,
  isReady,
  liveTick,
  locationCity,
  topSimilarTitle,
  breakEvenTime,
  panelSignal,
  insights,
  alertMessage,
}: DashboardRealtimeSurfaceProps) {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);

  const liveChartData = useMemo(
    () =>
      chartData.map((item, index) => ({
        ...item,
        value: applyLiveDrift(item.value, liveTick, index + activeSection.length, activeSection === "growth" ? 4 : 2),
      })),
    [activeSection, chartData, liveTick],
  );

  useEffect(() => {
    setSelectedInsight(null);
  }, [activeSection]);

  useEffect(() => {
    if (!isReady || insights.length === 0) return undefined;
    setActiveInsightIndex(0);
    const timer = window.setInterval(() => {
      setActiveInsightIndex((current) => (current + 1) % insights.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [insights, isReady]);

  useEffect(() => {
    if (!isReady || !alertMessage) return undefined;
    setAlertVisible(true);
    const timer = window.setTimeout(() => setAlertVisible(false), 3600);
    return () => window.clearTimeout(timer);
  }, [alertMessage, isReady, liveTick]);

  return (
    <>
      <section
        className={clsx(
          "relative grid gap-5 rounded-[30px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md transition-all duration-500 xl:grid-cols-[0.78fr_1.22fr]",
          isReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={clsx(
                "rounded-[24px] border border-white/10 bg-white/[0.04] p-5",
                index === 0 &&
                  "sm:col-span-2 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,47,73,0.64))]",
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{card.title}</p>
              <p className="mt-2 line-clamp-1 text-2xl font-black text-white">{card.value}</p>
              <p className="mt-3 text-sm text-slate-400">{card.caption}</p>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#020617]/45 p-5">
          <FloatingInsight className="right-4 top-4 hidden xl:flex" text={panelSignal} />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">{title}</p>
              <h2 className="mt-2 text-xl font-black text-white">{summary}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <LiveSignal />
              <Button href={href} variant="secondary" className="px-4 py-2.5 text-sm text-cyan-100">
                View Details
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>

          <div className="h-[300px]">
            {!isReady ? (
              <ChartSkeleton />
            ) : activeSection === "location" ? (
              <LocationVisual city={locationCity ?? "Selected city"} onSelect={setSelectedInsight} liveTick={liveTick} />
            ) : activeSection === "competition" ? (
              <BarVisual data={liveChartData} onSelect={setSelectedInsight} />
            ) : activeSection === "financial" || activeSection === "funding" ? (
              <PieVisual data={liveChartData} onSelect={setSelectedInsight} />
            ) : (
              <LineVisual data={liveChartData} onSelect={setSelectedInsight} />
            )}
          </div>

          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs text-slate-400">
            {selectedInsight ? (
              <>
                Selected insight: <span className="font-semibold text-white">{selectedInsight}</span>
              </>
            ) : (
              "Hover for tooltips or click a chart point to inspect the signal."
            )}
          </p>

          {topSimilarTitle && activeSection === "competition" ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs text-slate-400">
              Closest comparable: <span className="font-semibold text-white">{topSimilarTitle}</span>
            </p>
          ) : null}
          {breakEvenTime && activeSection === "financial" ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-xs text-slate-400">
              Break-even: <span className="font-semibold text-white">{breakEvenTime}</span>
            </p>
          ) : null}
        </div>
      </section>

      {isReady && insights.length > 0 ? (
        <aside className="pointer-events-none fixed right-4 top-24 z-30 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-cyan-300/20 bg-[#020617]/78 p-4 shadow-[0_18px_70px_rgba(2,6,23,0.55),0_0_32px_rgba(34,211,238,0.12)] backdrop-blur-md transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">AI Insights</p>
              <p className="mt-1 text-xs text-slate-500">Reactive simulation layer</p>
            </div>
          </div>
          <div key={activeInsightIndex} className="mt-4 animate-dashboard-card rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-sm leading-6 text-slate-200">{insights[activeInsightIndex]}</p>
          </div>
        </aside>
      ) : null}

      {isReady && alertMessage ? (
        <div
          className={clsx(
            "fixed bottom-5 right-5 z-40 flex w-[min(380px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-white/10 bg-[#020617]/86 p-4 shadow-[0_18px_70px_rgba(2,6,23,0.6)] backdrop-blur-md transition-all duration-500",
            alertVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            {alertMessage.toLowerCase().includes("saturation") ? <AlertTriangle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
          </div>
          <p className="text-sm leading-6 text-slate-200">{alertMessage}</p>
        </div>
      ) : null}
    </>
  );
}

function LineVisual({ data, onSelect }: { data: ChartDatum[]; onSelect: (value: string) => void }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        onClick={(state) => {
          const payload = state?.activePayload?.[0]?.payload as ChartDatum | undefined;
          if (payload) onSelect(`${payload.name}: ${Math.round(payload.value)}`);
        }}
      >
        <defs>
          <linearGradient id="dashboard-line-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(34,211,238,0.2)" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#dashboard-line-gradient)"
          strokeWidth={3}
          dot={{ fill: "#22d3ee", r: 4 }}
          activeDot={{ fill: "#67e8f9", r: 7, stroke: "#020617", strokeWidth: 2 }}
          isAnimationActive
          animationDuration={900}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function BarVisual({ data, onSelect }: { data: ChartDatum[]; onSelect: (value: string) => void }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        onClick={(state) => {
          const payload = state?.activePayload?.[0]?.payload as ChartDatum | undefined;
          if (payload) onSelect(`${payload.name}: ${Math.round(payload.value)}`);
        }}
      >
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34,211,238,0.06)" }} />
        <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive animationDuration={760} animationEasing="ease-out">
          {data.map((_, index) => (
            <Cell key={index} fill={chartColors[index % chartColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieVisual({ data, onSelect }: { data: ChartDatum[]; onSelect: (value: string) => void }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={68}
          outerRadius={110}
          paddingAngle={4}
          isAnimationActive
          animationDuration={820}
          animationEasing="ease-out"
          onClick={(entry) => onSelect(`${String(entry.name)}: ${Math.round(Number(entry.value))}`)}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

type HeatZone = {
  id: number;
  label: string;
  status: "high" | "medium" | "low";
  score: number;
  competition: number;
  demand: number;
  trend: TrendState;
  active: boolean;
  style: { background: string; boxShadow: string; borderColor: string };
};

function LocationVisual({ city, onSelect, liveTick }: { city: string; onSelect: (value: string) => void; liveTick: number }) {
  const [hoveredZone, setHoveredZone] = useState<HeatZone | null>(null);
  const zones = useMemo<HeatZone[]>(
    () =>
      Array.from({ length: 30 }).map((_, index) => {
        const status = index % 9 === 0 ? "low" : index % 5 === 0 ? "medium" : "high";
        const score = status === "high" ? 74 + ((index + liveTick) % 12) : status === "medium" ? 48 + ((index + liveTick) % 10) : 26 + ((index + liveTick) % 9);
        const competition = status === "low" ? 82 : status === "medium" ? 57 : 34;
        const demand = status === "high" ? 79 : status === "medium" ? 54 : 33;
        const active = (index + liveTick) % 11 === 0;
        const trend = status === "high" ? "up" : status === "medium" ? "stable" : "down";
        const label = status === "low" ? "High competition zone" : status === "medium" ? "Medium opportunity zone" : "High profit zone";
        const tone =
          status === "high"
            ? {
                background: "radial-gradient(circle at 32% 24%, rgba(134,239,172,0.46), rgba(34,197,94,0.20) 48%, rgba(2,6,23,0.15) 100%)",
                glow: `0 0 ${active ? 24 : 14}px rgba(34,197,94,0.24)`,
                borderColor: "rgba(134,239,172,0.42)",
              }
            : status === "medium"
              ? {
                  background: "radial-gradient(circle at 32% 24%, rgba(253,224,71,0.40), rgba(234,179,8,0.18) 48%, rgba(2,6,23,0.15) 100%)",
                  glow: `0 0 ${active ? 20 : 12}px rgba(234,179,8,0.22)`,
                  borderColor: "rgba(253,224,71,0.36)",
                }
              : {
                  background: "radial-gradient(circle at 32% 24%, rgba(252,165,165,0.40), rgba(239,68,68,0.18) 48%, rgba(2,6,23,0.15) 100%)",
                  glow: `0 0 ${active ? 20 : 12}px rgba(239,68,68,0.22)`,
                  borderColor: "rgba(252,165,165,0.34)",
                };

        return {
          id: index,
          label,
          status,
          score,
          competition,
          demand,
          trend,
          active,
          style: {
            background: tone.background,
            boxShadow: `${tone.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
            borderColor: tone.borderColor,
          },
        };
      }),
    [liveTick],
  );

  return (
    <div className="relative h-full overflow-hidden rounded-[24px] border border-white/10 bg-[#020617] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_82%_76%,rgba(239,68,68,0.14),transparent_26%),linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,36px_36px,36px_36px]" />
      <div className="relative mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-white">{city}</p>
        <div className="flex gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Profit</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Competition</span>
        </div>
      </div>
      <div className="relative grid h-[230px] grid-cols-6 gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            aria-label={`${zone.label} ${zone.id + 1}`}
            onClick={() => onSelect(`${zone.label} ${zone.id + 1}`)}
            onMouseEnter={() => setHoveredZone(zone)}
            onMouseLeave={() => setHoveredZone((current) => (current?.id === zone.id ? null : current))}
            onFocus={() => setHoveredZone(zone)}
            onBlur={() => setHoveredZone((current) => (current?.id === zone.id ? null : current))}
            className={clsx("rounded-xl border transition duration-300 hover:-translate-y-1 hover:scale-[1.03]", zone.active && "scale-[1.02]")}
            style={zone.style}
          />
        ))}
      </div>
      {hoveredZone ? (
        <div className="pointer-events-none absolute bottom-4 right-4 w-48 rounded-2xl border border-white/10 bg-[#020617]/92 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">{hoveredZone.label}</p>
          <p className="mt-2 text-sm font-semibold text-white">Zone {hoveredZone.id + 1}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <span>Score</span>
            <span className="text-right font-semibold text-white">{hoveredZone.score}/100</span>
            <span>Demand</span>
            <span className="text-right font-semibold text-white">{hoveredZone.demand}</span>
            <span>Competition</span>
            <span className="text-right font-semibold text-white">{hoveredZone.competition}</span>
          </div>
          <div className="mt-3">
            <PredictiveBadge trend={hoveredZone.trend} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LiveSignal() {
  return (
    <span className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200 sm:inline-flex">
      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
      Live
    </span>
  );
}

function ChartSkeleton() {
  return (
    <div className="grid h-full place-items-center rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
      <div className="w-full space-y-4">
        <div className="skeleton-shimmer h-4 w-2/5 rounded-full" />
        <div className="grid h-48 grid-cols-6 items-end gap-3">
          {[44, 72, 56, 88, 63, 79].map((height, index) => (
            <div key={index} className="skeleton-shimmer rounded-t-2xl" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="skeleton-shimmer h-3 w-3/5 rounded-full" />
      </div>
    </div>
  );
}

function FloatingInsight({ text, className }: { text: string; className?: string }) {
  return (
    <div className={clsx("pointer-events-none absolute rounded-full border border-cyan-300/14 bg-[#020617]/84 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200 shadow-[0_12px_32px_rgba(2,6,23,0.4)]", className)}>
      {text}
    </div>
  );
}

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

function applyLiveDrift(value: number, tick: number, seed: number, range = 2) {
  const base = Number.isFinite(value) ? value : 0;
  const wave = Math.sin((tick + seed) * 0.72) * range + Math.cos((tick + seed) * 0.31) * (range / 2);
  return Math.max(0, Math.min(100, Math.round(base + wave)));
}
