"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  Download,
  FileBadge2,
  FileStack,
  Gauge,
  Globe2,
  LineChart,
  Map,
  Radar,
  Sparkles,
  TrendingUp,
  Trophy,
  Wand2,
} from "lucide-react";
import clsx from "clsx";

import { requestExplainableAi } from "@/api/explainResults";
import { requestIdeaCoach } from "@/api/ideaCoach";
import { AIBrainVisualization } from "@/components/AIBrainVisualization";
import type { IdeaDnaGene, IdeaDnaSummary } from "@/components/IdeaDNAScanner";
import { InnovationTimelineSimulator, InnovationTimelineStage } from "@/components/InnovationTimelineSimulator";
import type { GlobalInnovationMarker } from "@/components/GlobalInnovationMap";
import { InnovationBlackhole } from "@/components/InnovationBlackhole";
import type { IdeaGraphResponse } from "@/types/api";
import { CertificatePreview } from "@/components/insights/certificate-preview";
import { PitchDeckViewer } from "@/components/insights/PitchDeckViewer";
import { AnalysisCard } from "@/components/dashboard/analysis-card";
import { BackendConnectionHub } from "@/components/ideas/backend-connection-hub";
import { StartupBlueprint } from "@/components/ideas/startup-blueprint";

// Lazy load heavy chart and visualization components
const MarketGrowthChart = dynamic(() => import("@/charts/market-growth-chart").then(mod => mod.MarketGrowthChart), { ssr: false });
const CompetitorComparisonChart = dynamic(() => import("@/charts/competitor-comparison-chart").then(mod => mod.CompetitorComparisonChart), { ssr: false });
const ImpactTimelineChart = dynamic(() => import("@/charts/impact-timeline-chart").then(mod => mod.ImpactTimelineChart), { ssr: false });
const InnovationGaugeChart = dynamic(() => import("@/charts/innovation-gauge-chart").then(mod => mod.InnovationGaugeChart), { ssr: false });
const InnovationScoreBreakdownChart = dynamic(() => import("@/charts/innovation-score-breakdown").then(mod => mod.InnovationScoreBreakdownChart), { ssr: false });
const SimilarityBarChart = dynamic(() => import("@/charts/similarity-bar-chart").then(mod => mod.SimilarityBarChart), { ssr: false });
const StartupPotentialRadar = dynamic(() => import("@/charts/startup-potential-radar").then(mod => mod.StartupPotentialRadar), { ssr: false });

import { OpportunityFinder } from "@/components/OpportunityFinder";
import { MarketOpportunityPredictor } from "@/components/MarketOpportunityPredictor";
import { StartupSuccessEngine } from "@/components/StartupSuccessEngine";
import { buildInnovationMapData } from "@/engines/globalInnovationMapEngine";
import { buildBlackholeAnalysis } from "@/engines/blackholeDetector";
import { computeInnovationScoreV2 } from "@/engines/innovationScoreEngineV2";
import { computeOpportunity } from "@/engines/opportunityFinder";
import { readLatestAnalysis } from "@/services/latest-analysis";
import { readLatestIdeaGraph } from "@/services/latest-idea-graph";
import { readLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { readLatestInnovationMap } from "@/services/latest-innovation-map";
import { readLatestInvestorInsights } from "@/services/latest-investor-insights";
import { readLatestPitchDeck } from "@/services/latest-pitch-deck";
import { storeLatestIdeaInput } from "@/services/latest-idea-input";
import { storeSavedAnalysisReport } from "@/services/saved-analysis-reports";
import {
  AnalyzeIdeaResponse,
  ExplainableAiResponse,
  IdeaCoachResponse,
  IdeaGraphNodeType,
  InnovationMapResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";
import { SimilarIdea } from "@/types/idea";
import { exportFullReportDOCX } from "@/utils/exportFullReportDOCX";
import { exportFullReportPDF } from "@/utils/exportFullReportPDF";
import { formatAiResponse, FormattedAiResponse } from "@/utils/aiResponseFormatter";
import { applyDemoDataset, generateDemoDataset } from "@/utils/demoDataGenerator";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { NumberCounter } from "@/components/dashboard/number-counter";
import { DEMO_MODE } from "@/config/demoMode";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";

type ScenarioState = {
  launchCountry: string;
  developmentCost: number;
  competitionIncrease: number;
};

const defaultScenario: ScenarioState = {
  launchCountry: "United States",
  developmentCost: 240000,
  competitionIncrease: 8,
};

const countryBoosts: Record<string, number> = {
  "United States": 7,
  India: 6,
  Germany: 5,
  Singapore: 6,
  Japan: 4,
  "United Kingdom": 5,
};

const IdeaDNAScanner = dynamic(() => import("@/components/IdeaDNAScanner").then((mod) => mod.IdeaDNAScanner), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] rounded-[28px]" />,
});

const GlobalInnovationMap = dynamic(
  () => import("@/components/GlobalInnovationMap").then((mod) => mod.GlobalInnovationMap),
  { ssr: false, loading: () => <Skeleton className="h-[520px] rounded-[28px]" /> },
);

const IdeaGraphVisualizer = dynamic(
  () => import("@/components/IdeaGraphVisualizer").then((mod) => mod.IdeaGraphVisualizer),
  { ssr: false, loading: () => <Skeleton className="h-[680px] rounded-[28px]" /> },
);

export function ResultsView() {
  const [analysis, setAnalysis] = useState<AnalyzeIdeaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [explanation, setExplanation] = useState<ExplainableAiResponse | null>(null);
  const [coach, setCoach] = useState<IdeaCoachResponse | null>(null);
  const [graph, setGraph] = useState<IdeaGraphResponse | null>(null);
  const [innovationMap, setInnovationMap] = useState<InnovationMapResponse | null>(null);
  const [investor, setInvestor] = useState<InvestorDecisionResponse | null>(null);
  const [novelty, setNovelty] = useState<NoveltyCheckResponse | null>(null);
  const [scenario, setScenario] = useState<ScenarioState>(defaultScenario);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [showBrain, setShowBrain] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<FormattedAiResponse | null>(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  useEffect(() => {
    const latest = readLatestAnalysis();
    setAnalysis(latest);
    setGraph(readLatestIdeaGraph());
    setInnovationMap(readLatestInnovationMap());
    setInvestor(readLatestInvestorInsights());
    setNovelty(readLatestIdeaNovelty());
    setIsLoading(false);
    if (typeof window !== "undefined") {
      const stamp = window.localStorage.getItem("ai_brain_pending");
      if (stamp) {
        const age = Date.now() - Number(stamp);
        if (!Number.isNaN(age) && age < 5 * 60 * 1000) {
          setShowBrain(true);
        } else {
          window.localStorage.removeItem("ai_brain_pending");
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!analysis || explanation) {
      return;
    }

    setExplanationLoading(true);
    void requestExplainableAi({
      ideaName: analysis.idea_name,
      innovationScore: analysis.innovation_score,
      similarityScore: analysis.similarity_score,
      competitionLevel: analysis.competitor_intelligence.competition_level,
      technologyNovelty:
        analysis.external_intelligence?.technologyNovelty ?? analysis.radar_metrics.technology_readiness ?? 70,
      marketPotential: analysis.future_impact.market_potential,
    })
      .then(setExplanation)
      .catch(() => undefined)
      .finally(() => setExplanationLoading(false));
  }, [analysis, explanation]);

  const external = analysis?.external_intelligence;
  const mapData = innovationMap ?? (analysis ? buildInnovationMapData(analysis) : null);
  const pitchDeck = external?.pitchDeck ?? readLatestPitchDeck();
  const graphData = normalizeIdeaGraph(graph ?? external?.ideaGraph ?? null);
  const noveltyData = novelty ?? external?.novelty ?? null;
  const investorData = investor ?? external?.investorDecision ?? null;
  const blackholeAnalysis = analysis ? buildBlackholeAnalysis(analysis, external) : null;
  const uniquenessScore = Math.max(0, Math.min(100, external?.uniquenessScore ?? 100 - (analysis?.similarity_score ?? 0)));
  const innovationV2 = analysis ? computeInnovationScoreV2(analysis, noveltyData, investorData) : null;
  const opportunity = useMemo(
    () => (analysis ? computeOpportunity(analysis) : null),
    [analysis],
  );
  const canGenerateCertificate = (innovationV2?.score ?? analysis?.innovation_score ?? 0) >= 90;
  const { innovationScoreValue, similarityScoreValue } = useMemo(
    () => computeDisplayScores(analysis),
    [analysis],
  );
  const dnaProfile = useMemo(
    () => (analysis ? buildIdeaDnaProfile(analysis, noveltyData, investorData) : null),
    [analysis, noveltyData, investorData],
  );
  const timelineStages = useMemo(
    () => (analysis ? buildTimelineStages(analysis) : null),
    [analysis],
  );
  const globalMarkers = useMemo<GlobalInnovationMarker[]>(() => {
    if (mapData?.data?.length) {
      return mapData.data.map((item) => ({
        country: item.countryName ?? item.country,
        innovationCount: item.count,
        coordinates: [item.longitude, item.latitude],
        patents: item.patents,
        research: item.technologies,
        startups: item.repositories,
      }));
    }
    return [
      { country: "United States", innovationCount: 12, coordinates: [-95.7129, 37.0902] },
      { country: "Germany", innovationCount: 6, coordinates: [10.4515, 51.1657] },
      { country: "India", innovationCount: 8, coordinates: [78.9629, 20.5937] },
      { country: "Japan", innovationCount: 5, coordinates: [138.2529, 36.2048] },
      { country: "United Kingdom", innovationCount: 7, coordinates: [-3.436, 55.3781] },
    ];
  }, [mapData]);
  const breakdownChartData = useMemo(() => {
    if (!innovationV2) {
      return [];
    }
    return [
      { name: "Originality", value: innovationV2.breakdown.originality, color: "#38bdf8" },
      { name: "Technology", value: innovationV2.breakdown.technology, color: "#6366f1" },
      { name: "Market", value: innovationV2.breakdown.marketPotential, color: "#22c55e" },
      { name: "Research", value: innovationV2.breakdown.researchAlignment, color: "#22d3ee" },
      { name: "Competition", value: innovationV2.breakdown.competition, color: "#f97316" },
      { name: "Impact", value: innovationV2.breakdown.impact, color: "#facc15" },
    ];
  }, [innovationV2]);

  useEffect(() => {
    if (!analysis || aiInsights) {
      return;
    }
    let active = true;
    const loadingTimer = setTimeout(() => {
      if (active && !aiInsights) {
        setAiInsightsLoading(true);
      }
    }, 5000);
    const buildTimer = setTimeout(() => {
      if (!active) {
        return;
      }
      setAiInsights(
        formatAiResponse({
          analysis,
          explanation,
          investor: investorData,
          novelty: noveltyData,
          coach,
        }),
      );
      setAiInsightsLoading(false);
    }, 650);

    return () => {
      active = false;
      clearTimeout(loadingTimer);
      clearTimeout(buildTimer);
    };
  }, [analysis, aiInsights, explanation, investorData, noveltyData, coach]);

  const chartData = useMemo<SimilarIdea[]>(
    () =>
      (analysis?.top_similar_projects ?? []).map((item) => ({
        title: item.title,
        description: item.description,
        source: item.source,
        score: item.similarity_score,
      })),
    [analysis],
  );

  const radarMetrics = useMemo(
    () =>
      analysis
        ? [
            { metric: "Innovation", value: clamp(innovationV2?.score ?? analysis.innovation_score) },
            {
              metric: "Market Potential",
              value: clamp(investorData?.marketOpportunityScore ?? analysis.radar_metrics.market_potential ?? 72),
            },
            {
              metric: "Technology Complexity",
              value: clamp(analysis.radar_metrics.complexity ?? analysis.radar_metrics.technology_readiness ?? 68),
            },
            {
              metric: "Competition",
              value: clamp(analysis.similarity_score),
            },
            {
              metric: "Risk",
              value: clamp(
                investorData?.riskScore ??
                  (analysis.future_impact.risk_level.toLowerCase().includes("high") ? 72 : analysis.future_impact.risk_level.toLowerCase().includes("low") ? 38 : 56),
              ),
            },
          ]
        : [],
    [analysis, investorData],
  );

  const competitorChartData = useMemo(
    () =>
      (analysis?.competitor_intelligence.competitors ?? []).slice(0, 5).map((item) => ({
        name: String(item.name),
        traction: Number(item.similarity_score),
        maturity: Number(
          String(item.technology_maturity).toLowerCase().includes("advanced")
            ? 88
            : String(item.technology_maturity).toLowerCase().includes("growth")
              ? 70
              : 54,
        ),
      })),
    [analysis],
  );

  const scenarioOutput = useMemo(() => {
    if (!analysis) {
      return null;
    }

    const countryBoost = countryBoosts[scenario.launchCountry] ?? 3;
    const costPenalty = scenario.developmentCost / 15000;
    const competitionPenalty = scenario.competitionIncrease * 1.3;

    return {
      innovationScore: clamp(analysis.innovation_score + countryBoost - costPenalty * 0.25 - competitionPenalty * 0.35),
      investorScore: clamp((investorData?.investorScore ?? 68) + countryBoost - costPenalty * 0.18 - competitionPenalty * 0.55),
      marketPotential: clamp((investorData?.marketOpportunityScore ?? 72) + countryBoost - competitionPenalty * 0.45),
      risk: clamp((investorData?.riskScore ?? 54) + competitionPenalty * 0.5 + costPenalty * 0.35 - countryBoost * 0.2),
    };
  }, [analysis, investorData, scenario]);

  async function handleGenerateCoach() {
    if (!analysis) {
      return;
    }
    setCoachLoading(true);
    try {
      const response = await requestIdeaCoach({
        ideaName: analysis.idea_name,
        ideaDescription: analysis.idea_profile.problem_statement,
        innovationScore: analysis.innovation_score,
        competitionLevel: analysis.competitor_intelligence.competition_level,
      });
      setCoach(response);
    } finally {
      setCoachLoading(false);
    }
  }

  function handleBrainComplete() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ai_brain_pending");
    }
    window.setTimeout(() => setShowBrain(false), 400);
  }

  async function handleExport(format: "pdf" | "docx") {
    if (!analysis) {
      return;
    }

    if (format === "pdf") {
      await exportFullReportPDF({
        analysis,
        explanation,
        investor: investorData,
        novelty: noveltyData,
        coach,
        dnaProfile,
        timelineStages,
        aiInsights,
        innovationScoreV2: innovationV2,
        opportunity,
        globalMarkers,
      });
    } else {
      await exportFullReportDOCX({
        analysis,
        explanation,
        investor: investorData,
        novelty: noveltyData,
        coach,
        dnaProfile,
        timelineStages,
        aiInsights,
        innovationScoreV2: innovationV2,
        opportunity,
        globalMarkers,
      });
    }

    storeSavedAnalysisReport({
      id: `${analysis.idea_name}:${format}:${Date.now()}`,
      ideaName: analysis.idea_name,
      createdAt: new Date().toISOString(),
      format,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading results...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-400">
        <p>⚠ Failed to load results</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 rounded text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showBrain ? (
        <motion.div
          key="brain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AIBrainVisualization onComplete={handleBrainComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1220] to-[#020617] text-white space-y-10 pb-20">
            <div className="mt-8 px-6 md:px-10 lg:px-14 mb-10">
              <h2 className="text-cyan-400 text-sm tracking-widest mb-4">
                AI INNOVATION REPORT
              </h2>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 hover:border-cyan-400/30 transition-all">
                <div className="flex flex-col gap-6">
                  <ResultHeader
                    title={generateCleanTitle(analysis.idea_name, analysis.idea_profile.problem_statement)}
                    description={analysis.idea_profile.problem_statement}
                    tags={generateInnovationTags(
                      analysis.idea_profile.problem_statement,
                      analysis.idea_profile.industry,
                      analysis.idea_profile.technology_stack
                    )}
                    innovationScore={innovationScoreValue}
                    similarityScore={similarityScoreValue}
                  />

                  <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <p className="text-cyan-400 text-sm tracking-widest mb-3">AI Analysis Summary</p>
                    <p className="text-gray-300 leading-relaxed break-words italic">
                      "{explanation?.summary ?? `AI analysis suggests ${analysis.idea_name} shows ${analysis.innovation_score >= 70 ? 'strong' : 'moderate'} potential in the ${analysis.idea_profile.industry} sector. The concept addresses ${analysis.idea_profile.target_users.slice(0, 2).join(' and ')} needs with ${analysis.radar_metrics.technology_readiness >= 70 ? 'mature' : 'emerging'} technology readiness. ${analysis.similarity_score < 50 ? 'Low similarity to existing solutions indicates high originality.' : 'Similar solutions exist - differentiation will be key to success.'}`}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <Button variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => handleExport('pdf')}>
                      <Download className="mr-2 h-4 w-4" /> Export PDF
                    </Button>
                    <Button variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => handleExport('docx')}>
                      <FileStack className="mr-2 h-4 w-4" /> Export DOCX
                    </Button>
                  </div>
                </div>
              </div>

              <BackendConnectionHub analysis={analysis} />
              <StartupBlueprint analysis={analysis} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-10">
              {/* AI Innovation Summary */}
              <DashboardCard title="AI Innovation Summary" className="lg:col-span-7" delay={0.1}>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-bold">Idea Summary</p>
                    <p className="text-sm text-slate-300 leading-relaxed break-words bg-white/5 p-4 rounded-2xl border border-white/5">
                      {aiInsights?.ideaSummary ?? analysis.idea_profile.problem_statement}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-purple-400 uppercase tracking-[0.3em] font-bold">Key Technologies</p>
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 h-full">
                        {analysis.idea_profile.technology_stack.map(tech => (
                          <Badge key={tech} className="bg-purple-500/10 border-purple-500/20 text-purple-300 text-[10px] uppercase py-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-emerald-400 uppercase tracking-[0.3em] font-bold">Industry Analysis</p>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 h-full">
                        <p className="text-sm text-slate-300 break-words">{analysis.idea_profile.industry}</p>
                        <p className="mt-2 text-xs text-slate-500 break-words">{analysis.idea_profile.target_users.join(", ")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-bold">Innovation Analysis</p>
                    <p className="text-sm text-slate-300 leading-relaxed break-words bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                      "{explanation?.summary ?? "The score reflects a promising concept with visible differentiation, though competitive signals still shape the final result."}"
                    </p>
                  </div>
                </div>
              </DashboardCard>

              {/* Idea DNA Scanner */}
              <DashboardCard title="Idea DNA Scanner" subtitle="Innovation Genome" className="lg:col-span-5" delay={0.2}>
                {dnaProfile ? (
                  <IdeaDNAScanner genes={dnaProfile.genes} summary={dnaProfile.summary} />
                ) : (
                  <Skeleton className="h-[420px] rounded-[28px]" />
                )}
              </DashboardCard>

              {/* Innovation Timeline */}
              <DashboardCard title="Innovation Timeline" subtitle="Predicted Evolution Path" className="lg:col-span-full" delay={0.3}>
                {timelineStages ? (
                  <InnovationTimelineSimulator stages={timelineStages} />
                ) : (
                  <Skeleton className="h-[420px] rounded-[28px]" />
                )}
              </DashboardCard>

              {/* Similarity Analysis */}
              <DashboardCard title="Similarity Analysis" subtitle="Competitive Landscape" className="lg:col-span-full" delay={0.35}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7">
                    <SimilarityBarChart 
                      data={analysis.top_similar_projects.map(p => ({
                        title: p.title,
                        description: p.description,
                        source: p.source,
                        score: p.similarity_score
                      }))} 
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Top Mapped Projects</h4>
                    <div className="space-y-3">
                      {analysis.top_similar_projects.map((p, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{p.title}</span>
                            <span className="text-xs font-bold text-cyan-400">{p.similarity_score}%</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">{p.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-500 uppercase font-bold">{p.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DashboardCard>

              {/* Global Innovation Map */}
              <DashboardCard title="Global Innovation Map" subtitle="Geographic Intelligence" className="lg:col-span-8" delay={0.4}>
                <GlobalInnovationMap markers={globalMarkers} />
              </DashboardCard>

              {/* Opportunity Finder */}
              <DashboardCard title="Opportunity Areas" subtitle="Market Gap Detection" className="lg:col-span-4 overflow-visible h-auto" delay={0.5}>
                {opportunity ? (
                  <OpportunityFinder
                    data={opportunity}
                    onSelectIdea={(idea) => {
                      storeLatestIdeaInput({
                        ideaName: `${idea} Accelerator`,
                        ideaDescription: `New idea derived from ${idea} opportunity area.`,
                        mode: analysis.mode,
                      });
                    }}
                  />
                ) : (
                  <Skeleton className="h-[360px] rounded-[28px]" />
                )}
              </DashboardCard>

              {/* AI Recommendations */}
              <DashboardCard title="AI Recommendations" subtitle="Strategic Advice" className="lg:col-span-7" delay={0.6}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiInsights?.sections.map((section, idx) => (
                      <div key={section.title} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
                        <p className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-bold mb-3">{section.title}</p>
                        <ul className="space-y-3">
                          {section.bullets.slice(0, 3).map((bullet, i) => (
                            <li key={i} className="text-xs text-slate-300 flex gap-2 leading-relaxed">
                              <span className="text-cyan-500 mt-0.5">•</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                 </div>
              </DashboardCard>

              {/* Impact Simulation */}
              <DashboardCard title="Impact Simulation" subtitle="Multi-Factor Forecasting" className="lg:col-span-5" delay={0.7}>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 h-full">
                  <ImpactMetric label="Technology" value={analysis.radar_metrics.technology_readiness ?? 75} color="cyan" />
                  <ImpactMetric label="Economic" value={investorData?.marketOpportunityScore ?? 82} color="purple" />
                  <ImpactMetric label="Social" value={analysis.future_impact.social_impact ?? 68} color="emerald" />
                </div>
              </DashboardCard>

              {/* Market Opportunity Predictor */}
              <DashboardCard title="Market Predictor" subtitle="Demand Forecasting" className="lg:col-span-6" delay={0.8}>
                <MarketOpportunityPredictor
                  score={investorData?.marketOpportunityScore ?? analysis.radar_metrics.market_potential ?? 72}
                  marketSize={analysis.market_insights.market_size_billion_usd ? `$${analysis.market_insights.market_size_billion_usd}B` : "Large"}
                  competition={analysis.competitor_intelligence.competition_level}
                  growthPotential={analysis.market_insights.growth_forecast_cagr ? `${analysis.market_insights.growth_forecast_cagr}% CAGR` : "High"}
                />
              </DashboardCard>

              {/* Startup Success Engine */}
              <DashboardCard title="Success Engine" subtitle="Execution Probability" className="lg:col-span-6" delay={0.9}>
                <StartupSuccessEngine
                  probability={investorData?.fundingProbability ?? 64}
                  innovationStrength={scoreLabel(innovationV2?.score ?? analysis.innovation_score)}
                  marketFit={scoreLabel(investorData?.marketOpportunityScore ?? 72)}
                  executionRisk={riskLabel(investorData?.riskScore ?? 56)}
                />
              </DashboardCard>
            </div>

            {/* Certificate Unlock Section */}
            {canGenerateCertificate && (
              <DashboardCard title="Innovation Certificate" className="border-cyan-500/50 bg-cyan-500/5 py-10" delay={1.0}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                      <FileBadge2 className="h-10 w-10" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">Originality Award Unlocked</h4>
                      <p className="text-slate-400 mt-1">Your concept has reached the top 10% threshold of innovation excellence.</p>
                    </div>
                  </div>
                  <Button className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] text-white font-bold uppercase tracking-widest text-xs">
                     Generate Innovation Certificate
                  </Button>
                </div>
              </DashboardCard>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultHeader({
  title,
  description,
  tags,
  innovationScore,
  similarityScore,
}: {
  title: string;
  description: string;
  tags: string[];
  innovationScore: number;
  similarityScore: number;
}) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <img src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" className="h-10 w-10 rounded-full team-icon-glow" />
          <span className="text-cyan-400 tracking-wider uppercase text-xs font-semibold">AI Innovation Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4 break-words">
          {title}
        </h1>
        <p className="text-gray-300 leading-relaxed text-base break-words line-clamp-3">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0">
        <div className="flex items-center justify-center gap-6">
          <ScoreCard label="Innovation" value={`${innovationScore}%`} tone="cyan" />
          <div className="w-px h-14 bg-white/10" />
          <ScoreCard label="Similarity" value={`${similarityScore}%`} tone="purple" />
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "purple";
}) {
  const cardClass =
    "w-32 h-24 flex flex-col items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105";
  const styles = {
    cyan: "text-cyan-300 border-cyan-400/30 shadow-[0_0_16px_rgba(34,211,238,0.12)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    purple: "text-purple-300 border-purple-400/30 shadow-[0_0_16px_rgba(168,85,247,0.14)] hover:shadow-[0_0_20px_rgba(168,85,247,0.22)]",
  }[tone];

  const labelStyle = {
    cyan: "text-xs text-gray-400 mb-1 uppercase tracking-wide text-center",
    purple: "text-xs text-gray-400 mb-1 uppercase tracking-wide text-center",
  }[tone];

  const valueStyle = {
    cyan: "text-2xl font-bold text-cyan-400 text-center",
    purple: "text-2xl font-bold text-purple-400 text-center",
  }[tone];

  return (
    <div className={`${cardClass} ${styles}`}>
      <p className={labelStyle}>{label}</p>
      <p className={valueStyle}>{value}</p>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  icon: Icon,
  suffix = "",
}: {
  label: string;
  value: number | string;
  icon: typeof Gauge;
  suffix?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-400/10 p-3 text-sky-300">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">
        {typeof value === "number" ? Math.round(value) : value}
        {typeof value === "number" ? suffix : ""}
      </p>
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

// Helper function to generate clean AI report title from idea description
function generateCleanTitle(ideaName: string, description: string): string {
  // If idea name is already short and clean, use it
  if (ideaName && ideaName.length <= 60 && !ideaName.includes("...")) {
    return ideaName;
  }
  
  // Extract key concepts from description
  const cleanDesc = description.replace(/\s+/g, ' ').trim();
  const words = cleanDesc.split(' ').slice(0, 8);
  
  // Common innovation keywords to identify
  const keywords = ['app', 'platform', 'system', 'ai', 'automation', 'tracking', 
    'management', 'assistant', 'tool', 'solution', 'service', 'network'];
  
  // Find relevant keyword or use first few words
  const foundKeyword = keywords.find(kw => 
    cleanDesc.toLowerCase().includes(kw.toLowerCase())
  );
  
  let title = words.join(' ');
  
  // Add AI/tech prefix if not present
  if (foundKeyword && !title.toLowerCase().includes('ai')) {
    title = `AI ${foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1)} ${title}`;
  }
  
  // Limit to 60 characters
  if (title.length > 60) {
    title = title.substring(0, 57) + '...';
  }
  
  return title;
}

// Generate innovation tags from description
function generateInnovationTags(description: string, industry: string, technologies: string[]): string[] {
  const tags: string[] = [];
  const desc = description.toLowerCase();
  
  // Category tags
  if (desc.includes('finance') || desc.includes('money') || desc.includes('spending') || desc.includes('budget')) {
    tags.push('FinTech');
  }
  if (desc.includes('health') || desc.includes('medical') || desc.includes('fitness') || desc.includes('biometric')) {
    tags.push('HealthTech');
  }
  if (desc.includes('ai') || desc.includes('machine learning') || desc.includes('automation')) {
    tags.push('AI Tool');
  }
  if (desc.includes('mobile') || desc.includes('app')) {
    tags.push('Mobile App');
  }
  if (desc.includes('data') || desc.includes('analytics')) {
    tags.push('Data Analytics');
  }
  if (desc.includes('climate') || desc.includes('environment') || desc.includes('green')) {
    tags.push('GreenTech');
  }
  if (desc.includes('education') || desc.includes('learning') || desc.includes('training')) {
    tags.push('EdTech');
  }
  if (desc.includes('security') || desc.includes('privacy') || desc.includes('protection')) {
    tags.push('CyberSec');
  }
  
  // Add industry tag if not already included
  if (industry && !tags.includes(industry)) {
    const shortIndustry = industry.split(' ')[0];
    tags.push(shortIndustry);
  }
  
  // Add tech stack tags (first 2)
  technologies?.slice(0, 2).forEach(tech => {
    if (!tags.includes(tech)) {
      tags.push(tech);
    }
  });
  
  // Ensure we have at least 2 tags
  if (tags.length < 2) {
    if (!tags.includes('Innovation')) tags.push('Innovation');
    if (!tags.includes('Tech')) tags.push('Tech');
  }
  
  return tags.slice(0, 4); // Limit to 4 tags
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function computeDisplayScores(analysis: AnalyzeIdeaResponse | null) {
  if (!analysis) {
    return { innovationScoreValue: 0, similarityScoreValue: 0 };
  }

  const similarityRaw = Number(analysis.similarity_score);
  const similarity = Number.isFinite(similarityRaw) ? clamp(similarityRaw) : 0;
  const innovationRaw = 100 - similarity;
  const innovationSafe = Number.isFinite(innovationRaw) ? innovationRaw : 50;

  return {
    innovationScoreValue: clamp(Math.round(innovationSafe)),
    similarityScoreValue: clamp(Math.round(similarity)),
  };
}

function InsightCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="panel-hover rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition duration-300">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
        {bullets.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ImpactMetric({ label, value, color }: { label: string; value: number; color: "cyan" | "purple" | "emerald" }) {
  const colorClasses = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  };

  return (
    <div className={clsx("p-4 rounded-2xl border flex flex-col items-center justify-center gap-2", colorClasses[color])}>
      <p className="text-xs uppercase tracking-widest font-semibold">{label} Impact</p>
      <div className="relative flex items-center justify-center h-20 w-20">
         <svg className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36 * (1 - value / 100)}
              className="opacity-40"
            />
         </svg>
         <span className="absolute text-xl font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

function buildIdeaDnaProfile(
  analysis: AnalyzeIdeaResponse,
  noveltyData: NoveltyCheckResponse | null,
  investorData: InvestorDecisionResponse | null,
): { genes: IdeaDnaGene[]; summary: IdeaDnaSummary[] } {
  const riskScore = investorData?.riskScore ?? mapRiskLevelToScore(analysis.future_impact.risk_level);
  const researchSignals =
    analysis.resource_scan.similar_research.length +
    (analysis.external_intelligence?.researchPapers?.length ?? 0);
  const researchScore = clamp(45 + Math.min(55, researchSignals * 6));

  const genes: IdeaDnaGene[] = [
    {
      key: "technology",
      label: "Technology Gene",
      score: clamp(analysis.radar_metrics.technology_readiness ?? analysis.radar_metrics.complexity ?? 74),
      color: "#3b82f6",
      description: "Measures the sophistication of the technology stack powering the idea.",
    },
    {
      key: "market",
      label: "Market Gene",
      score: clamp(investorData?.marketOpportunityScore ?? analysis.radar_metrics.market_potential ?? 72),
      color: "#22c55e",
      description: "Reflects market demand strength and industry relevance signals.",
    },
    {
      key: "innovation",
      label: "Innovation Gene",
      score: clamp(noveltyData?.noveltyScore ?? analysis.innovation_score),
      color: "#a855f7",
      description: "Captures originality compared with patents, products, and research.",
    },
    {
      key: "research",
      label: "Research Gene",
      score: researchScore,
      color: "#22d3ee",
      description: "Indicates alignment with research papers and emerging technology threads.",
    },
    {
      key: "risk",
      label: "Risk Gene",
      score: clamp(riskScore),
      color: "#ef4444",
      description: "Represents technical and market risk pressure on the concept.",
    },
    {
      key: "impact",
      label: "Impact Gene",
      score: clamp(
        analysis.future_impact.social_impact ??
          analysis.future_impact.adoption_probability ??
          investorData?.marketOpportunityScore ??
          70,
      ),
      color: "#f59e0b",
      description: "Summarizes the projected social or economic impact potential.",
    },
  ];

  const summary: IdeaDnaSummary[] = [
    { label: "Technology Strength", value: scoreLabel(genes[0].score) },
    { label: "Market Potential", value: scoreLabel(genes[1].score) },
    { label: "Innovation Level", value: scoreLabel(genes[2].score) },
    { label: "Research Alignment", value: scoreLabel(genes[3].score) },
    { label: "Risk Level", value: riskLabel(genes[4].score) },
    { label: "Impact Potential", value: scoreLabel(genes[5].score) },
  ];

  return { genes, summary };
}

function buildTimelineStages(analysis: AnalyzeIdeaResponse): InnovationTimelineStage[] {
  const evolution = analysis.idea_evolution.slice(0, 4);
  const similarity = clamp(Number(analysis.similarity_score) || 0);
  const industry = analysis.idea_profile.industry || "target markets";
  const ideaName = analysis.idea_name || "the solution";

  const years =
    similarity > 60
      ? [2024, 2026, 2029, 2032]
      : similarity >= 30
        ? [2025, 2028, 2032, 2037]
        : [2025, 2030, 2035, 2042];

  const defaults: InnovationTimelineStage[] = [
    {
      year: years[0],
      title: "Prototype Development",
      summary: `Initial MVP development and early testing validate ${ideaName} in ${industry}.`,
      technology: "Core architecture stabilizes while early automation and data layers mature.",
      market: "Pilot programs with early adopters validate demand signals.",
      impact: "Early results shape the product narrative and go-to-market focus.",
      challenges: "Proving feasibility and securing early user trust.",
    },
    {
      year: years[1],
      title: "Startup Adoption",
      summary: `Scaling the product with early customers in ${industry} and adjacent segments.`,
      technology: "Infrastructure hardens for reliability and feature depth.",
      market: "Commercial adoption begins with targeted growth programs.",
      impact: "Initial market traction establishes credibility and momentum.",
      challenges: "Differentiation and execution speed versus emerging competitors.",
    },
    {
      year: years[2],
      title: "Enterprise Integration",
      summary: `Integration into larger systems and enterprise workflows accelerates.`,
      technology: "Advanced analytics, integrations, and automation expand capabilities.",
      market: "Enterprise adoption broadens the revenue base and partnerships.",
      impact: "Industry practices start adapting around the solution’s capabilities.",
      challenges: "Scaling operations, compliance, and support requirements.",
    },
    {
      year: years[3],
      title: "Global Impact",
      summary: `Widespread adoption positions ${ideaName} as a global innovation pillar.`,
      technology: "Ecosystem-level intelligence and optimization become core assets.",
      market: "International expansion and cross-sector adoption mature.",
      impact: "Long-term influence on industry standards and user behavior.",
      challenges: "Governance, ethics, and global regulatory alignment.",
    },
  ];

  return defaults.map((stage, index) => {
    const evolutionStep = evolution[index];
    if (!evolutionStep) {
      return stage;
    }
    return {
      ...stage,
      title: String(evolutionStep.version ?? stage.title),
      summary: String(evolutionStep.focus ?? stage.summary),
      technology: String(evolutionStep.technology ?? stage.technology),
      market: String(evolutionStep.market ?? stage.market),
      impact: String(evolutionStep.impact ?? stage.impact),
      challenges: String(evolutionStep.challenges ?? stage.challenges),
    };
  });
}

function scoreLabel(score: number) {
  if (score >= 80) return "Very High";
  if (score >= 65) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

function riskLabel(score: number) {
  if (score >= 75) return "High";
  if (score >= 55) return "Moderate";
  return "Low";
}

function mapRiskLevelToScore(riskLevel: string) {
  const lower = riskLevel.toLowerCase();
  if (lower.includes("high")) return 78;
  if (lower.includes("low")) return 38;
  return 56;
}
function normalizeIdeaGraph(
  graph: IdeaGraphResponse | { nodes: Array<{ id: string; type: string; label: string; description: string }>; edges: Array<{ source: string; target: string; weight: number; label: string }> } | null,
): IdeaGraphResponse | null {
  if (!graph) {
    return null;
  }

  if ("summary" in graph) {
    return graph;
  }

  const normalizedNodes = graph.nodes.map((node) => ({
    ...node,
    type: normalizeNodeType(node.type),
  }));

  const counts = normalizedNodes.reduce(
    (acc, node) => {
      acc[node.type] += 1;
      return acc;
    },
    {
      idea: 0,
      technology: 0,
      startup: 0,
      research: 0,
      industry: 0,
      product: 0,
    } as Record<IdeaGraphNodeType, number>,
  );

  return {
    nodes: normalizedNodes,
    edges: graph.edges,
    summary: {
      idea: "Idea Graph",
      technology_count: counts.technology,
      startup_count: counts.startup,
      research_count: counts.research,
      industry_count: counts.industry,
      product_count: counts.product,
    },
  };
}

function normalizeNodeType(value: string): IdeaGraphNodeType {
  switch (value) {
    case "technology":
    case "startup":
    case "research":
    case "industry":
    case "product":
      return value;
    default:
      return "idea";
  }
}



