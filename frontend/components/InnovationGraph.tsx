"use client";

import Link from "next/link";

import { IdeaGraphVisualizer } from "@/components/IdeaGraphVisualizer";
import { readLatestIdeaGraph } from "@/services/latest-idea-graph";
import { Card } from "@/ui/card";

export function InnovationGraph() {
  const graph = readLatestIdeaGraph();

  if (!graph) {
    return (
      <Card>
        <p className="panel-heading">Innovation Graph</p>
        <h2 className="panel-subtitle">No graph data available yet</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Run an analysis to generate the innovation graph visualization.
        </p>
        <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Go to analysis
        </Link>
      </Card>
    );
  }

  return <IdeaGraphVisualizer graph={graph} />;
}
