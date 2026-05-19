"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { readLatestAnalysis } from "@/services/latest-analysis";
import { AnalyzeIdeaResponse } from "@/types/api";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export function AnalyzePreview() {
  const [analysis, setAnalysis] = useState<AnalyzeIdeaResponse | null>(null);

  useEffect(() => {
    setAnalysis(readLatestAnalysis());
  }, []);

  const metrics = useMemo(
    () => [
      {
        label: "Idea Strength Meter",
        value: analysis ? Math.round((analysis.radar_metrics.originality + analysis.radar_metrics.feasibility) / 2) : 74,
        tone: "from-sky-400 to-cyan-300",
      },
      {
        label: "Innovation Progress",
        value: analysis ? Math.round(analysis.innovation_score) : 68,
        tone: "from-violet-400 to-fuchsia-300",
      },
      {
        label: "Similarity Breakdown",
        value: analysis ? Math.round(analysis.similarity_score) : 32,
        tone: "from-amber-300 to-orange-400",
      },
    ],
    [analysis],
  );
  const uniquenessScore = Math.max(0, Math.min(100, 100 - (analysis?.similarity_score ?? 32)));
  const canGenerateCertificate = uniquenessScore >= 90;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-[30px]">
      <Card className="panel-hover h-full">
        <p className="panel-heading">Analysis intelligence</p>
        <h2 className="panel-subtitle">Live readiness snapshot</h2>
        <div className="mt-6 grid gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 mb-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-200">{metric.label}</p>
                <span className="text-sm font-semibold text-white">{metric.value}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-[6px] bg-white/[0.06]">
                <div
                  className={`h-full rounded-[6px] bg-gradient-to-r ${metric.tone}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="panel-hover h-full">
        <p className="panel-heading">Submission guidance</p>
        <h2 className="panel-subtitle">How the AI engines will score this idea</h2>
        <div className="mt-6 space-y-4">
          {[
            "Idea strength meter checks originality plus feasibility signals before scoring.",
            "Innovation progress tracks how far the concept moves beyond known references.",
            "Similarity breakdown visualizes overlap risk before the results page opens.",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-slate-300">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Authenticity certificate</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {canGenerateCertificate
              ? `Latest uniqueness score is ${Math.round(uniquenessScore)}%, so this idea can generate an official authenticity certificate.`
              : "Certificate available only for ideas with uniqueness score above 90%."}
          </p>
          <div className="mt-4">
            {canGenerateCertificate ? (
              <Button href="/certificate">Generate Authenticity Certificate</Button>
            ) : (
              <Link href="/results" className="text-sm font-medium text-sky-300">
                Review latest results
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
