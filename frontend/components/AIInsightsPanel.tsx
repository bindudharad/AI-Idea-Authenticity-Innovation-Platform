"use client";

import { AiInsightResult } from "@/utils/aiInsightGenerator";
import { Card } from "@/ui/card";

type AIInsightsPanelProps = {
  insights: AiInsightResult;
};

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <Card>
      <p className="panel-heading">AI Insight Generator</p>
      <h2 className="panel-subtitle">Structured analysis</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InsightCard title="Idea Summary" bullets={[insights.ideaSummary]} />
        {insights.sections.map((section) => (
          <InsightCard key={section.title} title={section.title} bullets={section.bullets} />
        ))}
      </div>
    </Card>
  );
}

function InsightCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
        {bullets.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
