"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { requestGeneratedPitch } from "@/api/generatePitch";
import { EmptyAnalysisState } from "@/components/insights/empty-analysis-state";
import { PitchDeckViewer } from "@/components/insights/PitchDeckViewer";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";
import { buildPitchInputFromAnalysis } from "@/engines/pitchDeckEngine";
import { readLatestPitchDeck, storeLatestPitchDeck } from "@/services/latest-pitch-deck";
import { GeneratePitchResponse } from "@/types/api";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export function PitchGeneratorClient() {
  const analysis = useLatestAnalysis();
  const [pitchDeck, setPitchDeck] = useState<GeneratePitchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deckFingerprint = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return `${analysis.idea_name}:${analysis.innovation_score}:${analysis.market_insights.market_size_billion_usd}`;
  }, [analysis]);

  useEffect(() => {
    if (!analysis) {
      return;
    }

    const cached = readLatestPitchDeck();
    if (cached) {
      setPitchDeck(cached);
    }
  }, [analysis]);

  useEffect(() => {
    if (!analysis || !deckFingerprint) {
      return;
    }

    const cached = readLatestPitchDeck();
    if (cached?.sourceFingerprint === deckFingerprint) {
      setPitchDeck(cached);
      return;
    }

    void generateDeck();
  }, [analysis, deckFingerprint]);

  if (!analysis) {
    return <EmptyAnalysisState title="Run an analysis to generate a startup pitch" />;
  }

  async function generateDeck() {
    if (!analysis) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generated = await requestGeneratedPitch({
        ideaName: analysis.idea_name,
        ideaDescription: analysis.idea_profile.problem_statement,
        analysis,
      });

      const enriched = {
        ...generated,
        sourceFingerprint: deckFingerprint ?? undefined,
      };
      setPitchDeck(enriched);
      storeLatestPitchDeck(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate the pitch deck right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">AI pitch deck generator</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Investor-ready slides from your latest analysis</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Generate a concise deck that packages the problem, solution, market opportunity, technology narrative,
              business model, and future vision into a cleaner founder story.
            </p>
          </div>

          <Button onClick={() => void generateDeck()} className="min-w-[190px]">
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating..." : "Generate Pitch"}
          </Button>
        </div>
      </Card>

      {loading && !pitchDeck ? (
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Generating slides</p>
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <Skeleton className="h-[360px] rounded-[28px]" />
            <Skeleton className="h-[360px] rounded-[28px]" />
          </div>
        </Card>
      ) : null}

      {pitchDeck ? (
        <PitchDeckViewer
          ideaName={analysis.idea_name}
          slides={pitchDeck.slides}
          generatedAt={pitchDeck.generatedAt}
        />
      ) : null}

      {error ? (
        <Card className="border-rose-400/20">
          <p className="text-sm uppercase tracking-[0.18em] text-rose-300">Pitch generation issue</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{error}</p>
        </Card>
      ) : null}

      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Pitch strategy</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-500">Best wedge</p>
            <p className="mt-3 text-lg font-semibold text-white">{analysis.idea_profile.innovation_category}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-500">Competition signal</p>
            <p className="mt-3 text-lg font-semibold text-white">{analysis.competitor_intelligence.competition_level}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-500">Launch countries</p>
            <p className="mt-3 text-lg font-semibold text-white">{analysis.market_insights.best_countries_for_launch.join(", ")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Deck input snapshot</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(() => {
            const pitchInput = buildPitchInputFromAnalysis(analysis);
            return [
              { label: "Industry", value: pitchInput.ideaAnalysis.industry },
              { label: "Innovation score", value: String(pitchInput.innovationScore) },
              { label: "Market summary", value: pitchInput.marketInsights.summary },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-white">{item.value}</p>
              </div>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
}
