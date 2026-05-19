"use client";

import { Lightbulb, Link as LinkIcon } from "lucide-react";

import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

export function TechnologyKnowledgePanel({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const technologies = analysis.resource_scan.related_technologies.slice(0, 6);
  const resources = [
    ...analysis.resource_scan.similar_patents.slice(0, 2),
    ...analysis.resource_scan.similar_research.slice(0, 2),
  ];

  return (
    <Card className="panel-hover">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <p className="panel-heading">Technology Knowledge</p>
          <h2 className="panel-subtitle">Lightweight research panel</h2>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {technologies.map((item, index) => (
          <div key={`${String(item.name ?? "tech")}-${index}`} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200">
            {String(item.name ?? item.title ?? "Technology")} · {Math.round(Number(item.fit ?? item.relevance ?? 70))}%
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {resources.map((item, index) => (
          <div key={`${String(item.title ?? "resource")}-${index}`} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{String(item.title ?? "Reference")}</p>
                <p className="text-slate-400">{String(item.source ?? "Knowledge source")}</p>
              </div>
              {"link" in item && item.link ? <LinkIcon className="h-4 w-4 text-sky-300" /> : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
