"use client";

import {
  AnalyzeIdeaResponse,
  ExplainableAiResponse,
  IdeaCoachResponse,
  InvestorDecisionResponse,
  NoveltyCheckResponse,
} from "@/types/api";
import type { IdeaDnaGene } from "@/components/IdeaDNAScanner";
import type { InnovationTimelineStage } from "@/components/InnovationTimelineSimulator";
import type { AiInsightResult } from "@/utils/aiInsightGenerator";
import type { InnovationScoreV2Result } from "@/engines/innovationScoreEngineV2";
import type { OpportunityResult } from "@/engines/opportunityFinder";
import type { GlobalInnovationMarker } from "@/components/GlobalInnovationMap";

type ExportFullReportPdfOptions = {
  analysis: AnalyzeIdeaResponse;
  explanation?: ExplainableAiResponse | null;
  investor?: InvestorDecisionResponse | null;
  novelty?: NoveltyCheckResponse | null;
  coach?: IdeaCoachResponse | null;
  dnaProfile?: { genes: IdeaDnaGene[] } | null;
  timelineStages?: InnovationTimelineStage[] | null;
  aiInsights?: AiInsightResult | null;
  innovationScoreV2?: InnovationScoreV2Result | null;
  opportunity?: OpportunityResult | null;
  globalMarkers?: GlobalInnovationMarker[] | null;
};

export async function exportFullReportPDF({
  analysis,
  explanation,
  investor,
  novelty,
  coach,
  dnaProfile,
  timelineStages,
  aiInsights,
  innovationScoreV2,
  opportunity,
  globalMarkers,
}: ExportFullReportPdfOptions) {
  const html2pdf = (await import("html2pdf.js")).default;
  const logoUrl = "/team/team_vortex_icon.png";
  const fileName = "TEAM_VERTEX_Report.pdf";

  const ideaOverview = [
    `Industry: ${analysis.idea_profile.industry}`,
    `Target users: ${analysis.idea_profile.target_users.join(", ")}`,
    `Problem statement: ${analysis.idea_profile.problem_statement}`,
    `Technology stack: ${analysis.idea_profile.technology_stack.join(", ")}`,
  ];

  const similarityLines = [
    `Similarity score: ${analysis.similarity_score.toFixed(1)}%`,
    ...analysis.top_similar_projects.slice(0, 4).map(
      (item) => `${item.title} (${item.source}) - ${item.similarity_score.toFixed(1)}% similarity`,
    ),
  ];

  const innovationLines = [
    `Innovation score: ${(innovationScoreV2?.score ?? analysis.innovation_score).toFixed(1)}`,
    innovationScoreV2?.category ? `Category: ${innovationScoreV2.category}` : "",
    `Novelty score: ${Math.round(novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score))}`,
    ...(explanation?.bullets ?? []),
    explanation?.summary ?? "The innovation score blends similarity, novelty, and competition signals.",
  ].filter(Boolean);

  const dnaLines = dnaProfile?.genes?.length
    ? dnaProfile.genes.map((gene) => `${gene.label}: ${Math.round(gene.score)}`)
    : [];

  const timelineLines = timelineStages?.length
    ? timelineStages.map((stage) => `${stage.year} — ${stage.title}: ${stage.summary}`)
    : [];

  const aiInsightLines = aiInsights
    ? [aiInsights.ideaSummary, ...aiInsights.sections.flatMap((section) => [section.title, ...section.bullets])]
    : [];

  const breakdownLines = innovationScoreV2
    ? [
        `Originality: ${Math.round(innovationScoreV2.breakdown.originality)}`,
        `Technology: ${Math.round(innovationScoreV2.breakdown.technology)}`,
        `Market potential: ${Math.round(innovationScoreV2.breakdown.marketPotential)}`,
        `Research alignment: ${Math.round(innovationScoreV2.breakdown.researchAlignment)}`,
        `Competition: ${Math.round(innovationScoreV2.breakdown.competition)}`,
        `Impact: ${Math.round(innovationScoreV2.breakdown.impact)}`,
      ]
    : [];

  const opportunityLines = opportunity
    ? [
        `Opportunity score: ${Math.round(opportunity.score)} (${opportunity.level})`,
        ...opportunity.areas.map((area) => `${area.title} — ${area.reason}`),
        opportunity.explanation,
      ]
    : [];

  const mapLines = globalMarkers?.length
    ? globalMarkers.map((marker) => `${marker.country}: ${marker.innovationCount} innovation signals`)
    : [];

  const competitorLines = analysis.competitor_intelligence.competitors
    .slice(0, 5)
    .map(
      (item) =>
        `${String(item.name)} - ${String(item.technology_maturity)} maturity - ${Number(item.similarity_score).toFixed(1)}% similarity`,
    );

  const marketLines = [
    `Estimated market size: $${analysis.market_insights.market_size_billion_usd.toFixed(1)}B`,
    `Growth trend: ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR`,
    `Competition density: ${analysis.competitor_intelligence.competition_level}`,
    analysis.market_insights.summary,
  ];

  const investorLines = [
    `Investor score: ${Math.round(investor?.investorScore ?? analysis.external_intelligence?.investorDecision?.investorScore ?? 0)}`,
    `Funding probability: ${Math.round(investor?.fundingProbability ?? analysis.external_intelligence?.investorDecision?.fundingProbability ?? 0)}%`,
    investor?.recommendation ?? analysis.external_intelligence?.investorDecision?.recommendation ?? "Investor recommendation unavailable.",
  ];

  const evolutionLines = analysis.idea_evolution
    .slice(0, 4)
    .map((step) => `${String(step.timeframe)} - ${String(step.focus)}`);

  const coachLines = coach
    ? [coach.enhancedIdeaVersion, coach.futureVersion, coach.startupScalableVersion]
    : [];

  const pageHeader = `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <img src="${logoUrl}" class="w-12 h-12 object-contain" />
        <h1 class="text-xl font-bold text-gray-800">TEAM_VORTEX</h1>
      </div>
      <span class="text-sm text-gray-500">AI Innovation Intelligence Report</span>
    </div>
  `;

  const sectionCard = (title: string, lines: string[]) => `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] no-break">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">${title}</h2>
      <div class="space-y-2 text-sm text-gray-800">
        ${lines.map((line) => `<p class="break-words overflow-visible">${line}</p>`).join("")}
      </div>
    </div>
  `;

  const buildPage = (content: string) => `
    <div class="pdf-page">
      ${pageHeader}
      <div class="fixed top-1/2 left-1/2 opacity-5 text-6xl rotate-[-30deg] pointer-events-none text-gray-300">TEAM_VORTEX</div>
      <div class="space-y-6">
        ${content}
      </div>
      <div class="text-center text-xs text-gray-500 mt-10">
        Powered by TEAM_VORTEX • AI Innovation Intelligence Platform
      </div>
    </div>
  `;

  const pages = [
    buildPage(`
      ${sectionCard("Idea Overview", ideaOverview)}
      ${sectionCard("Similarity Analysis", similarityLines)}
      ${sectionCard("Innovation Score", innovationLines)}
    `),
    buildPage(`
      ${dnaLines.length ? sectionCard("Idea DNA Profile", dnaLines) : ""}
      ${timelineLines.length ? sectionCard("Innovation Timeline Simulator", timelineLines) : ""}
      ${aiInsightLines.length ? sectionCard("Structured AI Insights", aiInsightLines) : ""}
    `),
    buildPage(`
      ${breakdownLines.length ? sectionCard("Innovation Score Breakdown", breakdownLines) : ""}
      ${opportunityLines.length ? sectionCard("Innovation Opportunity Finder", opportunityLines) : ""}
      ${mapLines.length ? sectionCard("Global Innovation Map", mapLines) : ""}
    `),
    buildPage(`
      ${sectionCard("Competitor Intelligence", competitorLines)}
      ${sectionCard("Market Potential", marketLines)}
      ${sectionCard("Investor Insights", investorLines)}
      ${sectionCard("Idea Evolution", evolutionLines)}
      ${coachLines.length ? sectionCard("AI Suggested Improvements", coachLines) : ""}
    `),
  ].join("");

  const html = `
    <style>
      body { background: #ffffff; color: #111827; font-family: 'Inter', sans-serif; overflow: visible !important; }
      .pdf-page { page-break-after: always; break-after: page; padding: 40px; min-height: 100vh; background: #ffffff; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
    </style>
    <div>${pages}</div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: 0.5,
        filename: fileName,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      } as any)
      .from(container)
      .save();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
