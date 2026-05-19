"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { requestIdeaGraph } from "@/api/ideaGraph";
import { IdeaGraphVisualizer } from "@/components/IdeaGraphVisualizer";
import { getDemoAccessToken } from "@/services/demo-session";
import { readLatestAnalysis } from "@/services/latest-analysis";
import { readLatestIdeaGraph, storeLatestIdeaGraph } from "@/services/latest-idea-graph";
import { readLatestIdeaInput } from "@/services/latest-idea-input";
import { IdeaGraphResponse } from "@/types/api";
import { Card } from "@/ui/card";

export default function IdeaGraphPageView() {
  const [analysisName, setAnalysisName] = useState<string | null>(null);
  const [graph, setGraph] = useState<IdeaGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadGraph() {
      const latestAnalysis = readLatestAnalysis();
      if (latestAnalysis && active) {
        setAnalysisName(latestAnalysis.idea_name);
      }

      const storedGraph = readLatestIdeaGraph();
      if (storedGraph && active) {
        setGraph(storedGraph);
      }

      const latestInput = readLatestIdeaInput();
      if (!latestInput) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        const token = await getDemoAccessToken();
        if (!token) {
          if (active) {
            setLoading(false);
          }
          return;
        }
        const graphResponse = await requestIdeaGraph(latestInput, token);
        if (!active) {
          return;
        }
        storeLatestIdeaGraph(graphResponse);
        setGraph(graphResponse);
        setError(null);
      } catch (requestError) {
        if (active && !storedGraph) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load the idea graph.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadGraph();

    return () => {
      active = false;
    };
  }, []);

  if (!analysisName && !graph && !loading) {
    return (
      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">No analysis found</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Analyze an idea to generate its global graph</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The AI Global Idea Graph uses the latest analysis context to map technologies, research, startups, and
          industries around your concept.
        </p>
        <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Go to analysis
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Idea</p>
          <h2 className="mt-3 text-xl font-semibold text-white">{analysisName ?? graph?.summary.idea}</h2>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Technologies</p>
          <p className="mt-3 text-3xl font-semibold text-white">{graph?.summary.technology_count ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Research + Industry</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {(graph?.summary.research_count ?? 0) + (graph?.summary.industry_count ?? 0)}
          </p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Competitors + Products</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {(graph?.summary.startup_count ?? 0) + (graph?.summary.product_count ?? 0)}
          </p>
        </Card>
      </div>

      {error ? (
        <Card>
          <p className="text-sm text-coral">{error}</p>
        </Card>
      ) : null}

      {loading && !graph ? (
        <div className="space-y-6">
          <Card>
            <div className="skeleton-shimmer h-4 w-32 rounded-full" />
            <div className="mt-4 skeleton-shimmer h-8 w-80 rounded-2xl" />
            <div className="mt-4 skeleton-shimmer h-5 w-full rounded-full" />
          </Card>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="h-[680px] p-0">
              <div className="h-full w-full skeleton-shimmer rounded-[28px]" />
            </Card>
            <Card>
              <div className="skeleton-shimmer h-4 w-32 rounded-full" />
              <div className="mt-4 skeleton-shimmer h-8 w-48 rounded-2xl" />
              <div className="mt-6 grid gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="skeleton-shimmer h-16 w-full rounded-[22px]" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {graph ? <IdeaGraphVisualizer graph={graph} /> : null}
    </div>
  );
}
