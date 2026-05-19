import { AnalyzeIdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

export function PitchGeneratorCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const sections = Object.entries(analysis.pitch);

  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Pitch generator engine</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Founder-ready narrative</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {sections.map(([key, value]) => (
          <div key={key} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">{key.replace("_", " ")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
