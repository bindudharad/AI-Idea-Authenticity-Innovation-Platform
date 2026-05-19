"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { OpportunityRadarChart } from "@/charts/opportunity-radar-chart";
import { OpportunityResult } from "@/engines/opportunityFinder";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";

type OpportunityFinderProps = {
  data: OpportunityResult;
  onSelectIdea?: (idea: string) => void;
};

export function OpportunityFinder({ data, onSelectIdea }: OpportunityFinderProps) {
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);

  const radarData = [
    { metric: "Technology Growth", value: data.metrics.technologyGrowth },
    { metric: "Market Demand", value: data.metrics.marketDemand },
    { metric: "Research Trends", value: data.metrics.researchTrend },
    { metric: "Competition Level", value: data.metrics.competitionLevel },
  ];

  function handleSelect(title: string) {
    setSelectedIdea(title);
    onSelectIdea?.(title);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
        <OpportunityRadarChart data={radarData} />
      </div>

      <div className="w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Opportunity Score</p>
          <Badge tone={data.level === "High" ? "success" : data.level === "Moderate" ? "info" : "warning"}>
            {data.level}
          </Badge>
        </div>
        <p className="text-3xl font-semibold text-white">{Math.round(data.score)}</p>
        <p className="text-gray-300 leading-relaxed break-words">{data.explanation}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Opportunity Alignment: {data.alignmentScore >= 75 ? "High" : data.alignmentScore >= 55 ? "Moderate" : "Emerging"}
        </p>
      </div>

      <div className="w-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 space-y-4">
        <div className="grid gap-3">
          {data.areas.map((area) => (
            <motion.button
              key={area.title}
              type="button"
              onClick={() => handleSelect(area.title)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                selectedIdea === area.title
                  ? "border-sky-400/50 bg-sky-400/12 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/15 hover:bg-white/[0.06]"
              }`}
              whileHover={{ y: -2 }}
            >
              <p className="text-sm font-semibold">{area.title}</p>
              <p className="mt-2 text-xs leading-6 text-gray-300 break-words">{area.reason}</p>
            </motion.button>
          ))}
        </div>

        {selectedIdea ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-200">
            New idea suggestion generated for <span className="font-semibold text-white">{selectedIdea}</span>.
          </div>
        ) : null}
      </div>
    </div>
  );
}
