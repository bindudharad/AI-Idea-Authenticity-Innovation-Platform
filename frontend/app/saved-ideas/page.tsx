"use client";

import { useEffect, useState } from "react";

import { OwnershipTimeline } from "@/components/ideas/ownership-timeline";
import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState, EmptyIdeaState, ErrorState } from "@/components/shared/module-state";
import { readCurrentIdeaContext, storeCurrentIdeaContext } from "@/services/current-idea";
import { readAccessToken } from "@/services/auth-session";
import { getLatestAnalysisResult, getUserIdeas } from "@/services/idea-service";
import { AnalysisResultResponse, IdeaResponse } from "@/types/api";
import { Card } from "@/ui/card";

export default function SavedIdeasPage() {
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaResponse | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = readAccessToken();

  useEffect(() => {
    let active = true;
    if (!token) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const userIdeas = await getUserIdeas(token);
        if (!active) return;
        setIdeas(userIdeas);

        const stored = readCurrentIdeaContext();
        const nextIdea = userIdeas.find((item) => item.id === stored?.ideaId) ?? userIdeas[0] ?? null;
        setSelectedIdea(nextIdea);
        if (nextIdea) {
          storeCurrentIdeaContext({ ideaId: nextIdea.id, title: nextIdea.title });
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load saved ideas.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    if (!token || !selectedIdea) {
      setLatestAnalysis(null);
      return;
    }

    void getLatestAnalysisResult(selectedIdea.id, token)
      .then((response) => {
        if (active) {
          setLatestAnalysis(response);
        }
      })
      .catch(() => {
        if (active) {
          setLatestAnalysis(null);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedIdea, token]);

  if (!token) {
    return <PageShell title="Saved Ideas" description="Browse saved workspaces and version history from the backend."><AuthRequiredState title="Sign in to open Saved Ideas" /></PageShell>;
  }
  if (loading) {
    return <PageShell title="Saved Ideas" description="Browse saved workspaces and version history from the backend."><Card className="p-6">Loading saved ideas...</Card></PageShell>;
  }
  if (error) {
    return <PageShell title="Saved Ideas" description="Browse saved workspaces and version history from the backend."><ErrorState message={error} /></PageShell>;
  }
  if (ideas.length === 0) {
    return <PageShell title="Saved Ideas" description="Browse saved workspaces and version history from the backend."><EmptyIdeaState title="No saved ideas yet" description="Your analyzed ideas will appear here automatically once you create a workspace from the analyze page." /></PageShell>;
  }

  return (
    <PageShell title="Saved Ideas" description="Browse saved workspaces and version history from the backend.">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="panel-hover">
          <p className="panel-heading">Saved workspaces</p>
          <div className="mt-4 space-y-3">
            {ideas.map((idea) => (
              <button
                key={idea.id}
                type="button"
                onClick={() => {
                  setSelectedIdea(idea);
                  storeCurrentIdeaContext({ ideaId: idea.id, title: idea.title });
                }}
                className={`w-full rounded-[22px] border p-4 text-left transition ${
                  selectedIdea?.id === idea.id ? "border-cyan-400/40 bg-cyan-500/10" : "border-white/10 bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <p className="font-semibold text-white">{idea.title}</p>
                <p className="mt-2 text-sm text-slate-300">{idea.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <span>{idea.mode}</span>
                  <span>{idea.is_public ? "Public" : "Private"}</span>
                  <span>{Math.round(idea.innovation_score)} innovation</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="panel-hover">
          <p className="panel-heading">Idea detail</p>
          <h2 className="panel-subtitle">{selectedIdea?.title ?? "Select an idea"}</h2>
          {selectedIdea ? (
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>{selectedIdea.description}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Innovation</p><p className="mt-2 text-xl font-semibold text-white">{Math.round(selectedIdea.innovation_score)}</p></div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Similarity</p><p className="mt-2 text-xl font-semibold text-white">{Math.round(selectedIdea.latest_similarity_score)}%</p></div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Versions</p><p className="mt-2 text-xl font-semibold text-white">{selectedIdea.versions.length}</p></div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest backend analysis</p>
                <p className="mt-2 text-white">{latestAnalysis?.ai_summary ?? "No structured summary stored yet."}</p>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <OwnershipTimeline versions={selectedIdea?.versions ?? []} ideaTitle={selectedIdea?.title} />
    </PageShell>
  );
}
