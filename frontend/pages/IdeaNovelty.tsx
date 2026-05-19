"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeAlert, BookOpenText, Cpu, Fingerprint, Radar } from "lucide-react";

import { requestNoveltyCheck } from "@/api/noveltyCheck";
import { GraphContainer } from "@/components/dashboard/graph-container";
import { InsightPanel } from "@/components/dashboard/insight-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";
import { NoveltyGaugeMeter } from "@/charts/novelty-gauge-meter";
import { readLatestIdeaInput } from "@/services/latest-idea-input";
import { readLatestIdeaNovelty, storeLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";

export default function IdeaNoveltyPageView() {
  const analysis = useLatestAnalysis();
  const [novelty, setNovelty] = useState<ReturnType<typeof readLatestIdeaNovelty>>(null);
  const [loading, setLoading] = useState(true);

  const fingerprint = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return `${analysis.idea_name}:${analysis.innovation_score}:${analysis.external_intelligence?.similarityScore ?? analysis.similarity_score}`;
  }, [analysis]);

  useEffect(() => {
    let active = true;
    const cached = readLatestIdeaNovelty();
    if (cached) {
      setNovelty(cached);
      setLoading(false);
    }

    const latestInput = readLatestIdeaInput();
    if (!latestInput) {
      setLoading(false);
      return;
    }

    if (cached?.sourceFingerprint && fingerprint && cached.sourceFingerprint === fingerprint) {
      setLoading(false);
      return;
    }

    void requestNoveltyCheck({
      ideaName: latestInput.ideaName,
      ideaDescription: latestInput.ideaDescription,
      ideaAnalysis: analysis?.external_intelligence?.ideaAnalysis,
      patents: analysis?.external_intelligence?.patents,
      githubRepos: analysis?.external_intelligence?.githubRepos,
      wikipediaResults: analysis?.external_intelligence?.wikipedia,
      similarityScore: analysis?.external_intelligence?.similarityScore ?? analysis?.similarity_score,
    })
      .then((result) => {
        if (!active) {
          return;
        }
        const enriched = { ...result, sourceFingerprint: fingerprint ?? undefined };
        storeLatestIdeaNovelty(enriched);
        setNovelty(enriched);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [analysis, fingerprint]);

  if (!analysis && !novelty && !loading) {
    return (
      <Card className="panel-hover">
        <p className="panel-heading">No analysis found</p>
        <h2 className="panel-subtitle">Run an idea analysis before opening Idea Novelty</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The novelty detector compares your concept against patents, technology signals, and open-source references.
        </p>
        <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Go to analysis
        </Link>
      </Card>
    );
  }

  const insightLines = novelty
    ? [
        `Novelty level: ${novelty.noveltyLevel}.`,
        `Patent overlap is ${Math.round(novelty.patentOverlap)} with competition density at ${Math.round(novelty.competitionDensity)}.`,
        novelty.relatedTechnologies.length > 0
          ? `Related technologies: ${novelty.relatedTechnologies.slice(0, 4).join(", ")}.`
          : "Few repeated technology signals were found in the external scan.",
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Novelty Score" value={`${Math.round(novelty?.noveltyScore ?? 0)}`} animatedValue={Math.round(novelty?.noveltyScore ?? 0)} detail="Higher scores indicate more whitespace relative to known patents and public technical signals." icon={Fingerprint} accent="emerald" />
        <MetricCard label="Innovation Level" value={novelty?.noveltyLevel ?? "--"} detail="Qualitative read on whether the concept feels common, differentiated, or breakthrough." icon={Radar} accent="violet" />
        <MetricCard label="Patent Overlap" value={`${Math.round(novelty?.patentOverlap ?? 0)}%`} animatedValue={Math.round(novelty?.patentOverlap ?? 0)} valueSuffix="%" detail="How much the current concept overlaps with patent-style references." icon={BookOpenText} accent="amber" />
        <MetricCard label="Technology Overlap" value={`${Math.round(novelty?.technologyOverlap ?? 0)}%`} animatedValue={Math.round(novelty?.technologyOverlap ?? 0)} valueSuffix="%" detail="Signal overlap across technical concepts and open-source implementation patterns." icon={Cpu} accent="coral" />
      </div>

      {loading && !novelty ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Skeleton className="h-[360px] rounded-[30px]" />
          <Skeleton className="h-[360px] rounded-[30px]" />
        </div>
      ) : null}

      {novelty ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
            <GraphContainer eyebrow="Novelty engine" title="Novelty Gauge Meter" copy="A quick view of how differentiated the concept appears across public technology and prior-art signals.">
              <NoveltyGaugeMeter value={novelty.noveltyScore} />
            </GraphContainer>
            <Card className="panel-hover">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="panel-heading">Novelty decision</p>
                  <h2 className="panel-subtitle">Innovation originality readout</h2>
                </div>
                <Badge tone={novelty.noveltyScore >= 80 ? "success" : novelty.noveltyScore >= 60 ? "info" : "warning"}>
                  {novelty.noveltyLevel}
                </Badge>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-slate-500">Similarity score</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{Math.round(novelty.similarityScore)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-slate-500">Competition density</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{Math.round(novelty.competitionDensity)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-slate-500">Patent penalty</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{novelty.patentOverlapPenalty.toFixed(2)}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-slate-500">Technology penalty</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{novelty.technologyOverlapPenalty.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="panel-hover">
              <div className="flex items-center gap-3">
                <BadgeAlert className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="panel-heading">Similar patents</p>
                  <h2 className="panel-subtitle">Closest prior-art references</h2>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {novelty.relatedPatents.length > 0 ? (
                  novelty.relatedPatents.map((patent) => (
                    <div key={`${patent.patentNumber}-${patent.title}`} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                      <p className="text-base font-semibold text-white">{patent.title}</p>
                      <p className="mt-2 text-sm text-slate-400">{patent.applicant}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {patent.patentNumber || "Patent pending"} • {patent.filingDate || "Date unavailable"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                    No close patent titles were flagged by the novelty engine, which is a positive sign for originality.
                  </div>
                )}
              </div>
            </Card>

            <Card className="panel-hover">
              <p className="panel-heading">Related technologies</p>
              <h2 className="panel-subtitle">Repeated technical signals</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {novelty.relatedTechnologies.length > 0 ? (
                  novelty.relatedTechnologies.map((technology) => (
                    <span key={technology} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200">
                      {technology}
                    </span>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                    The current scan did not detect a heavy concentration around the same technology phrases.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <InsightPanel title="Novelty Insights" insights={insightLines} />
        </>
      ) : null}
    </div>
  );
}
