import { ArrowDown, ArrowRight } from "lucide-react";

import { Card } from "@/ui/card";

const nodes = [
  "User",
  "Next.js Frontend",
  "Idea Analysis Engine",
  "Resource Scanner",
  "Similarity Engine",
  "Impact & Market Engines",
  "PostgreSQL",
  "FAISS",
];

export function ArchitectureViewer() {
  return (
    <Card className="h-full">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">System architecture</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Core platform flow</h3>
      <div className="mt-6 hidden items-center flex-wrap gap-5 xl:flex">
        {nodes.map((node, index) => (
          <div key={node} className="flex items-center gap-5">
            <div className="rounded-xl border border-white/10 bg-white/5 px-[18px] py-3 text-sm font-medium text-white whitespace-nowrap">
              {node}
            </div>
            {index < nodes.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-500" /> : null}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 xl:hidden">
        {nodes.map((node, index) => (
          <div key={node} className="flex flex-col items-center gap-3 w-full">
            <div className="w-full rounded-xl border border-white/10 bg-white/5 px-[18px] py-3 text-center text-sm font-medium text-white">
              {node}
            </div>
            {index < nodes.length - 1 ? <ArrowDown className="h-4 w-4 text-slate-500" /> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
