"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, GitCompare, Layers3, Loader2, Save, RefreshCcw, Users2 } from "lucide-react";

import { getDemoAccessToken } from "@/services/demo-session";
import { readLatestIdeaInput } from "@/services/latest-idea-input";
import { storeCurrentIdeaContext, readCurrentIdeaContext } from "@/services/current-idea";
import {
  createAnalysisResult,
  downloadIdeaCertificate,
  getSimilarIdeas,
  impactPrediction,
  innovationScore,
  marketPrediction,
  registerIdea,
  resourceScanner,
  similarityCheck,
  updateIdea,
} from "@/services/idea-service";
import type {
  AnalyzeIdeaPayload,
  AnalyzeIdeaResponse,
  ImpactPredictionResponse,
  IdeaResponse,
  InnovationScoreResponse,
  MarketPredictionResponse,
  PublicIdeaResponse,
  ResourceScanResponse,
  SimilarityCheckResponse,
} from "@/types/api";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { useIdeaStore } from "@/store/use-idea-store";

type BackendConnectionHubProps = {
  analysis: AnalyzeIdeaResponse;
};

type EngineOutputs = {
  similarity: SimilarityCheckResponse | null;
  innovation: InnovationScoreResponse | null;
  resources: ResourceScanResponse | null;
  market: MarketPredictionResponse | null;
  impact: ImpactPredictionResponse | null;
};

const emptyOutputs: EngineOutputs = {
  similarity: null,
  innovation: null,
  resources: null,
  market: null,
  impact: null,
};

export function BackendConnectionHub({ analysis }: BackendConnectionHubProps) {
  const hydrateWorkspace = useIdeaStore((state) => state.hydrateWorkspace);
  const [currentIdea, setCurrentIdea] = useState<IdeaResponse | null>(null);
  const [ideaDraft, setIdeaDraft] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [similarIdeas, setSimilarIdeas] = useState<PublicIdeaResponse[]>([]);
  const [engineOutputs, setEngineOutputs] = useState<EngineOutputs>(emptyOutputs);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);

  const latestInput = useMemo(() => readLatestIdeaInput(), []);

  useEffect(() => {
    setIdeaDraft(latestInput?.ideaDescription ?? analysis.idea_profile.problem_statement ?? analysis.idea_name);
    const stored = readCurrentIdeaContext();
    if (stored && stored.title === analysis.idea_name) {
      setCurrentIdea((previous) =>
        previous ?? {
          id: stored.ideaId,
          title: stored.title,
          description: latestInput?.ideaDescription ?? analysis.idea_profile.problem_statement ?? analysis.idea_name,
          mode: analysis.mode,
          is_public: false,
          innovation_score: analysis.innovation_score,
          latest_similarity_score: analysis.similarity_score,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          versions: [],
        },
      );
    }
  }, [analysis, latestInput]);

  useEffect(() => {
    if (!latestInput) {
      return;
    }

    void handleLoadSimilarIdeas();
    void handleLoadEngineOutputs();
  }, [latestInput?.ideaName, latestInput?.ideaDescription, latestInput?.mode]);

  async function handleSaveIdea() {
    if (!latestInput) {
      setErrorMessage("No analyzed idea is available to save yet.");
      return;
    }

    setSaveLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setErrorMessage("Please sign in to save this idea.");
        return;
      }
      const savedIdea = currentIdea?.id
        ? await updateIdea(
            currentIdea.id,
            {
              description: ideaDraft,
              is_public: isPublic,
            },
            token,
          )
        : await registerIdea(
            {
              idea_name: latestInput.ideaName,
              description: ideaDraft,
              mode: latestInput.mode,
              is_public: isPublic,
            },
            token,
          );

      await createAnalysisResult(
        {
          idea_id: savedIdea.id,
          innovation_score: analysis.innovation_score,
          similarity_score: analysis.similarity_score,
          technology_readiness: analysis.radar_metrics.technology_readiness ?? analysis.radar_metrics.complexity ?? 0,
          market_potential: analysis.radar_metrics.market_potential ?? 0,
          ai_summary: analysis.future_impact.outlook,
          problem_statement: analysis.idea_profile.problem_statement,
          proposed_solution: ideaDraft,
          innovation_highlights: analysis.suggestions.slice(0, 4),
        },
        token,
      );

      setCurrentIdea(savedIdea);
      setIsPublic(savedIdea.is_public);
      storeCurrentIdeaContext({ ideaId: savedIdea.id, title: savedIdea.title });
      hydrateWorkspace({
        idea: savedIdea,
        analysis,
        context: { ideaId: savedIdea.id, title: savedIdea.title },
      });
      setStatusMessage(
        currentIdea?.id
          ? "New idea version saved to the backend workspace."
          : "Idea saved to the backend workspace with version history enabled.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save this idea right now.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleLoadSimilarIdeas() {
    if (!latestInput) {
      return;
    }

    setSimilarLoading(true);
    setErrorMessage(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setErrorMessage("Please sign in to view similar ideas.");
        return;
      }
      const ideas = await getSimilarIdeas(latestInput.ideaDescription, latestInput.mode, token);
      setSimilarIdeas(ideas);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load similar ideas.");
    } finally {
      setSimilarLoading(false);
    }
  }

  async function handleLoadEngineOutputs() {
    if (!latestInput) {
      return;
    }

    setEngineLoading(true);
    setErrorMessage(null);

    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setErrorMessage("Please sign in to load backend engine outputs.");
        return;
      }
      const payload: AnalyzeIdeaPayload = {
        idea_name: latestInput.ideaName,
        idea_text: latestInput.ideaDescription,
        mode: latestInput.mode,
      };

      const [similarity, innovation, resources, market, impact] = await Promise.all([
        similarityCheck(payload, token),
        innovationScore(payload, token),
        resourceScanner(payload, token),
        marketPrediction(payload, token),
        impactPrediction(payload, token),
      ]);

      setEngineOutputs({
        similarity,
        innovation,
        resources,
        market,
        impact,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load backend engine outputs.");
    } finally {
      setEngineLoading(false);
    }
  }

  async function handleDownloadCertificate() {
    if (!currentIdea?.id) {
      setErrorMessage("Save the idea first to unlock backend certificate download.");
      return;
    }

    setCertificateLoading(true);
    setErrorMessage(null);

    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setErrorMessage("Please sign in to download the certificate.");
        return;
      }
      const blob = await downloadIdeaCertificate(currentIdea.id, token);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${currentIdea.title.replace(/\s+/g, "_")}_certificate.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage("Certificate downloaded from the backend successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to download the certificate.");
    } finally {
      setCertificateLoading(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="border-white/10 bg-white/[0.04]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="panel-heading">Backend Workspace</p>
            <h3 className="panel-subtitle">Save ideas, create versions, and unlock server features</h3>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
            {currentIdea?.id ? `Idea #${currentIdea.id}` : "Unsaved"}
          </div>
        </div>

        <label className="mt-6 block space-y-2">
          <span className="text-sm text-slate-300">Server-backed idea description</span>
          <textarea
            value={ideaDraft}
            onChange={(event) => setIdeaDraft(event.target.value)}
            rows={6}
            className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-cyan-400/50"
          />
        </label>

        <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-400"
          />
          Publish this idea to the community feed
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => void handleSaveIdea()} disabled={saveLoading}>
            {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : currentIdea?.id ? <RefreshCcw className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {currentIdea?.id ? "Update Version" : "Save Idea"}
          </Button>
          <Button variant="secondary" onClick={() => void handleDownloadCertificate()} disabled={certificateLoading}>
            {certificateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Backend Certificate
          </Button>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : null}
      </Card>

      <Card className="border-white/10 bg-white/[0.04]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="panel-heading">Similar Ideas Panel</p>
            <h3 className="panel-subtitle">Backend similarity search over dataset and community ideas</h3>
          </div>
          <Button variant="secondary" onClick={() => void handleLoadSimilarIdeas()} disabled={similarLoading}>
            {similarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {similarIdeas.length > 0 ? (
            similarIdeas.slice(0, 6).map((idea, index) => (
              <div key={`${idea.title}-${index}`} className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">{idea.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{idea.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{idea.source} • {idea.mode}</p>
                  </div>
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200">
                    {Math.round(idea.similarity_score)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              Similar ideas will appear here after the backend similarity query runs.
            </div>
          )}
        </div>
      </Card>

      <Card className="border-white/10 bg-white/[0.04] xl:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="panel-heading">Backend Engine Outputs</p>
            <h3 className="panel-subtitle">Expose the Python engines directly inside the results UI</h3>
          </div>
          <Button variant="secondary" onClick={() => void handleLoadEngineOutputs()} disabled={engineLoading}>
            {engineLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers3 className="h-4 w-4" />}
            Refresh Engines
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <EngineCard
            title="Similarity Engine"
            items={[
              `Top similarity: ${Math.round(engineOutputs.similarity?.similarity_score ?? analysis.similarity_score)}%`,
              ...((engineOutputs.similarity?.top_similar_projects ?? analysis.top_similar_projects).slice(0, 3).map(
                (item) => `${item.title} (${Math.round(item.similarity_score)}%)`,
              )),
            ]}
          />
          <EngineCard
            title="Innovation Engine"
            items={[
              `Innovation score: ${Math.round(engineOutputs.innovation?.innovation_score ?? analysis.innovation_score)}`,
              `Technology novelty: ${Math.round(engineOutputs.innovation?.technology_novelty ?? analysis.innovation_breakdown.technology_novelty ?? 0)}`,
              `Market uniqueness: ${Math.round(engineOutputs.innovation?.market_uniqueness ?? analysis.innovation_breakdown.market_uniqueness ?? 0)}`,
            ]}
          />
          <EngineCard
            title="Resource Scanner"
            items={[
              `Industry: ${engineOutputs.resources?.idea_profile.industry ?? analysis.idea_profile.industry}`,
              `Patents found: ${(engineOutputs.resources?.resource_scan.similar_patents ?? analysis.resource_scan.similar_patents).length}`,
              `Research matches: ${(engineOutputs.resources?.resource_scan.similar_research ?? analysis.resource_scan.similar_research).length}`,
              `Related technologies: ${(engineOutputs.resources?.resource_scan.related_technologies ?? analysis.resource_scan.related_technologies).length}`,
            ]}
          />
          <EngineCard
            title="Market Predictor"
            items={[
              `Market size: $${engineOutputs.market?.market_insights.market_size_billion_usd ?? analysis.market_insights.market_size_billion_usd}B`,
              `Growth forecast: ${engineOutputs.market?.market_insights.growth_forecast_cagr ?? analysis.market_insights.growth_forecast_cagr}% CAGR`,
              `Competition: ${engineOutputs.market?.competitor_intelligence.competition_level ?? analysis.competitor_intelligence.competition_level}`,
            ]}
          />
          <EngineCard
            title="Impact Predictor"
            items={[
              `Market potential: ${engineOutputs.impact?.future_impact.market_potential ?? analysis.future_impact.market_potential}`,
              `Adoption probability: ${Math.round(engineOutputs.impact?.future_impact.adoption_probability ?? analysis.future_impact.adoption_probability)}%`,
              `Risk level: ${engineOutputs.impact?.future_impact.risk_level ?? analysis.future_impact.risk_level}`,
              `Simulation scenarios: ${(engineOutputs.impact?.impact_simulations ?? analysis.impact_simulations).length}`,
            ]}
          />
          <EngineCard
            title="Connected Modules"
            items={[
              "Idea save and version history is now backed by FastAPI.",
              "Similar idea search is pulled from the backend similarity endpoint.",
              "Workspace and server profile can use the saved idea context.",
              "Certificate download now uses the authenticated backend route.",
            ]}
            icon={<Users2 className="h-4 w-4 text-cyan-300" />}
          />
        </div>
      </Card>
    </div>
  );
}

function EngineCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: ReactNode;
}) {
  return (
    <details className="rounded-[24px] border border-white/10 bg-black/15 p-5" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-white">
        <span>{title}</span>
        {icon ?? <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Open</span>}
      </summary>
      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
        {items.map((item, index) => (
          <p key={`${title}-${index}`}>{item}</p>
        ))}
      </div>
    </details>
  );
}
