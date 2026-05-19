"use client";

import { Document, Packer, Paragraph, TextRun } from "docx";

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

type ExportFullReportDocxOptions = {
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportFullReportDOCX({
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
}: ExportFullReportDocxOptions) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "AI Innovation Intelligence Report", bold: true, size: 34 })],
          }),
          new Paragraph(`Idea: ${analysis.idea_name}`),
          new Paragraph(`Generated: ${new Date().toLocaleString()}`),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Idea Overview", bold: true })] }),
          new Paragraph(`Industry: ${analysis.idea_profile.industry}`),
          new Paragraph(`Target users: ${analysis.idea_profile.target_users.join(", ")}`),
          new Paragraph(`Problem statement: ${analysis.idea_profile.problem_statement}`),
          new Paragraph(`Technology type: ${analysis.idea_profile.technology_stack.join(", ")}`),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Similarity Analysis", bold: true })] }),
          new Paragraph(`Similarity score: ${analysis.similarity_score.toFixed(1)}%`),
          ...analysis.top_similar_projects.slice(0, 4).map(
            (item) => new Paragraph(`- ${item.title} (${item.source}) - ${item.similarity_score.toFixed(1)}% similarity`),
          ),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Innovation Score", bold: true })] }),
          new Paragraph(`Innovation score: ${(innovationScoreV2?.score ?? analysis.innovation_score).toFixed(1)}`),
          ...(innovationScoreV2?.category ? [new Paragraph(`Category: ${innovationScoreV2.category}`)] : []),
          new Paragraph(`Novelty score: ${Math.round(novelty?.noveltyScore ?? Math.max(0, 100 - analysis.similarity_score))}`),
          ...(explanation?.bullets ?? []).map((bullet) => new Paragraph(`- ${bullet}`)),
          new Paragraph(explanation?.summary ?? "The innovation score blends similarity, novelty, and competition signals."),
          ...(dnaProfile?.genes?.length
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Idea DNA Profile", bold: true })] }),
                ...dnaProfile.genes.map((gene) => new Paragraph(`${gene.label}: ${Math.round(gene.score)}`)),
              ]
            : []),
          ...(timelineStages?.length
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Innovation Timeline Simulator", bold: true })] }),
                ...timelineStages.map((stage) => new Paragraph(`${stage.year} - ${stage.title}: ${stage.summary}`)),
              ]
            : []),
          ...(aiInsights
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Structured AI Insights", bold: true })] }),
                new Paragraph(aiInsights.ideaSummary),
                ...aiInsights.sections.flatMap((section) => [
                  new Paragraph(section.title),
                  ...section.bullets.map((bullet) => new Paragraph(bullet)),
                ]),
              ]
            : []),
          ...(innovationScoreV2
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Innovation Score Breakdown", bold: true })] }),
                new Paragraph(`Originality: ${Math.round(innovationScoreV2.breakdown.originality)}`),
                new Paragraph(`Technology: ${Math.round(innovationScoreV2.breakdown.technology)}`),
                new Paragraph(`Market potential: ${Math.round(innovationScoreV2.breakdown.marketPotential)}`),
                new Paragraph(`Research alignment: ${Math.round(innovationScoreV2.breakdown.researchAlignment)}`),
                new Paragraph(`Competition: ${Math.round(innovationScoreV2.breakdown.competition)}`),
                new Paragraph(`Impact: ${Math.round(innovationScoreV2.breakdown.impact)}`),
              ]
            : []),
          ...(opportunity
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Innovation Opportunity Finder", bold: true })] }),
                new Paragraph(`Opportunity score: ${Math.round(opportunity.score)} (${opportunity.level})`),
                ...opportunity.areas.map((area) => new Paragraph(`${area.title} - ${area.reason}`)),
                new Paragraph(opportunity.explanation),
              ]
            : []),
          ...(globalMarkers?.length
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "Global Innovation Map", bold: true })] }),
                ...globalMarkers.map((marker) => new Paragraph(`${marker.country}: ${marker.innovationCount} signals`)),
              ]
            : []),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Competitor Intelligence", bold: true })] }),
          ...analysis.competitor_intelligence.competitors.slice(0, 5).map(
            (item) =>
              new Paragraph(
                `- ${String(item.name)} | ${String(item.technology_maturity)} | ${Number(item.similarity_score).toFixed(1)}% similarity`,
              ),
          ),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Market Potential", bold: true })] }),
          new Paragraph(`Estimated market size: $${analysis.market_insights.market_size_billion_usd.toFixed(1)}B`),
          new Paragraph(`Growth trend: ${analysis.market_insights.growth_forecast_cagr.toFixed(1)}% CAGR`),
          new Paragraph(`Competition density: ${analysis.competitor_intelligence.competition_level}`),
          new Paragraph(analysis.market_insights.summary),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Investor Insights", bold: true })] }),
          new Paragraph(
            `Investor score: ${Math.round(investor?.investorScore ?? analysis.external_intelligence?.investorDecision?.investorScore ?? 0)}`,
          ),
          new Paragraph(
            `Funding probability: ${Math.round(investor?.fundingProbability ?? analysis.external_intelligence?.investorDecision?.fundingProbability ?? 0)}%`,
          ),
          new Paragraph(investor?.recommendation ?? analysis.external_intelligence?.investorDecision?.recommendation ?? "Investor recommendation unavailable."),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: "Idea Evolution", bold: true })] }),
          ...analysis.idea_evolution.slice(0, 4).map((step) => new Paragraph(`- ${String(step.timeframe)} | ${String(step.focus)}`)),
          ...(coach
            ? [
                new Paragraph(""),
                new Paragraph({ children: [new TextRun({ text: "AI Suggested Improvements", bold: true })] }),
                new Paragraph(`Enhanced idea version: ${coach.enhancedIdeaVersion}`),
                new Paragraph(`Future version: ${coach.futureVersion}`),
                new Paragraph(`Startup scalable version: ${coach.startupScalableVersion}`),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${analysis.idea_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-innovation-report.docx`);
}
