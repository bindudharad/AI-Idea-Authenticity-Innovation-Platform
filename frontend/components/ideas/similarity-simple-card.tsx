"use client";

import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

export function SimilaritySimpleCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  return (
    <Card className="panel-hover">
      <p className="panel-heading">Similarity Card</p>
      <h2 className="panel-subtitle">Closest comparable ideas</h2>
      <div className="mt-6 space-y-3">
        {analysis.top_similar_projects.slice(0, 4).map((item) => (
          <div key={`${item.title}-${item.source}`} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.source}</p>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {Math.round(item.similarity_score)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
