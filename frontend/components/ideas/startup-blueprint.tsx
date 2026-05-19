"use client";

import { useMemo, type ReactNode } from "react";
import { Bot, BriefcaseBusiness, Download, Globe2, Layers3, Rocket, Users2, Wallet } from "lucide-react";

import { buildStartupBlueprint } from "@/engines/startupBlueprintEngine";
import type { AnalyzeIdeaResponse } from "@/types/api";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

type StartupBlueprintProps = {
  analysis: AnalyzeIdeaResponse;
};

export function StartupBlueprint({ analysis }: StartupBlueprintProps) {
  const blueprint = useMemo(() => buildStartupBlueprint(analysis), [analysis]);

  function handleDownload() {
    const payload = {
      idea: analysis.idea_name,
      blueprint,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${analysis.idea_name.replace(/\s+/g, "_")}_startup_blueprint.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="border-white/10 bg-white/[0.04]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="panel-heading">One-Click Startup Blueprint</p>
          <h3 className="panel-subtitle">Turn one analysis into a founder-ready operating blueprint</h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This dashboard is generated directly from the backend analysis payload, so the blueprint stays grounded in the same
            similarity, innovation, market, and impact signals powering the core system.
          </p>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download Blueprint
        </Button>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <BlueprintCard
          icon={<Rocket className="h-4 w-4 text-cyan-300" />}
          title="Problem + Solution"
          items={[blueprint.problem, blueprint.solution]}
        />
        <BlueprintCard
          icon={<Users2 className="h-4 w-4 text-violet-300" />}
          title="Target Users"
          items={blueprint.targetUsers}
        />
        <BlueprintCard
          icon={<Layers3 className="h-4 w-4 text-sky-300" />}
          title="Execution Plan"
          items={blueprint.roadmap.flatMap((phase) => [`${phase.phase} • ${phase.timeEstimate}`, ...phase.tasks])}
        />
        <BlueprintCard
          icon={<Bot className="h-4 w-4 text-emerald-300" />}
          title="Tech Stack + APIs"
          items={[...blueprint.techStack, ...blueprint.requiredApis]}
        />
        <BlueprintCard
          icon={<BriefcaseBusiness className="h-4 w-4 text-amber-300" />}
          title="Team Builder"
          items={blueprint.team.map((role) => `${role.role}: ${role.skills.join(", ")} • ${role.hiringPlan}`)}
        />
        <BlueprintCard
          icon={<Wallet className="h-4 w-4 text-rose-300" />}
          title="Cost + Revenue"
          items={[
            `MVP build cost: $${blueprint.costEstimation.mvpBuildUsd.toLocaleString()}`,
            `Monthly run cost: $${blueprint.costEstimation.monthlyRunUsd.toLocaleString()}`,
            `First-year team cost: $${blueprint.costEstimation.firstYearTeamUsd.toLocaleString()}`,
            ...blueprint.revenueModel,
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <BlueprintCard
          title="Digital Twin"
          items={blueprint.digitalTwin.map(
            (persona) =>
              `${persona.name}, ${persona.age}, ${persona.role} • liked: ${persona.liked} • confused: ${persona.confused} • dropped: ${persona.dropPoint} • satisfaction: ${persona.satisfaction}/100`,
          )}
        />
        <BlueprintCard
          title="Startup Simulator"
          items={[
            ...blueprint.simulator.growth.map((point) => `${point.month}: ${point.users} projected users`),
            blueprint.simulator.revenueProjection,
            `Success probability: ${blueprint.simulator.successProbability}%`,
            ...blueprint.simulator.risks.map((risk) => `Risk: ${risk}`),
          ]}
        />
        <BlueprintCard
          icon={<Globe2 className="h-4 w-4 text-cyan-300" />}
          title="Global + Mentor"
          items={[
            `Best decision: ${blueprint.mentor.bestDecision}`,
            ...blueprint.mentor.alternatives.map((item) => `Alternative: ${item}`),
            ...blueprint.mentor.actionSteps.map((item) => `Action: ${item}`),
            ...blueprint.global.bestCountries.map((item) => `Best country: ${item}`),
            ...blueprint.global.marketGaps.map((item) => `Gap: ${item}`),
            ...blueprint.global.expansionPlan.map((item) => `Expansion: ${item}`),
            `Pitch summary: ${blueprint.pitchSummary}`,
          ]}
        />
      </div>
    </Card>
  );
}

function BlueprintCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/15 p-5">
      <div className="flex items-center gap-3">
        {icon ?? <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />}
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">{title}</p>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
        {items.map((item, index) => (
          <p key={`${title}-${index}`}>{item}</p>
        ))}
      </div>
    </div>
  );
}
