import { BrainCircuit, ChartNoAxesCombined, FileStack, Users } from "lucide-react";

import { Card } from "@/ui/card";

const features = [
  {
    title: "Similarity Detection",
    description: "Screen concepts against project submissions, startup databases, repositories, and research themes.",
    icon: BrainCircuit
  },
  {
    title: "Innovation Analytics",
    description: "Turn similarity data into originality, feasibility, complexity, and market potential insights.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Ownership Proof",
    description: "Register ideas, track versions, and download certificates that capture score and submission date.",
    icon: FileStack
  },
  {
    title: "Team Workspace",
    description: "Coordinate notes, comments, and contributors inside a focused product development environment.",
    icon: Users
  }
];

export function FeatureGrid() {
  return (
    <section className="section-shell py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-glow">What the platform does</p>
        <h2 className="section-title mt-3">Everything needed to validate an idea before it becomes a product.</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="min-h-[220px]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] text-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
