import { Lightbulb, Rocket, Shield } from "lucide-react";

import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

const suggestions = [
  "Add a competitive moat explorer for patent and market narrative checks.",
  "Support team scorecards so multiple founders can rate originality collaboratively.",
  "Introduce real-time trend overlays to compare new ideas against rising technology themes."
];

type InnovationScoreCardProps = {
  score?: number;
  suggestions?: string[];
  category?: string;
};

export function InnovationScoreCard({ score = 66, suggestions: suggestionList = suggestions, category }: InnovationScoreCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Innovation Insight</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {category ? `${category} with room to sharpen defensibility` : "Differentiated, with room to sharpen defensibility"}
          </h3>
        </div>
        <Badge tone="success">Innovation {score.toFixed(1)}/100</Badge>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Lightbulb className="h-5 w-5 text-solar" />
          <p className="mt-4 text-lg font-semibold text-white">Originality</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">Novel combination of scoring, ownership proof, and startup evaluation.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Shield className="h-5 w-5 text-glow" />
          <p className="mt-4 text-lg font-semibold text-white">Protection</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">Private submissions and timestamped certificates create stronger proof of authorship.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <Rocket className="h-5 w-5 text-coral" />
          <p className="mt-4 text-lg font-semibold text-white">Startup Potential</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">Clear SaaS workflow with strong applicability across education, incubation, and enterprise innovation.</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">AI suggestions</p>
        <div className="mt-3 space-y-3">
          {suggestionList.map((suggestion) => (
            <div key={suggestion} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
