"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ScanSearch, Sparkles, Target } from "lucide-react";

import { runIntegratedIdeaAnalysis } from "@/api/analyzeIdea";
import { requestGeneratedPitch } from "@/api/generatePitch";
import { requestInvestorDecision } from "@/api/investorDecision";
import { requestNoveltyCheck } from "@/api/noveltyCheck";
import { buildInnovationMapData } from "@/engines/globalInnovationMapEngine";
import { analyzeIdea } from "@/services/idea-service";
import { getDemoAccessToken } from "@/services/demo-session";
import { storeLatestAnalysis } from "@/services/latest-analysis";
import { storeLatestIdeaGraph } from "@/services/latest-idea-graph";
import { storeLatestIdeaInput } from "@/services/latest-idea-input";
import { storeLatestInnovationMap } from "@/services/latest-innovation-map";
import { storeLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { storeLatestInvestorInsights } from "@/services/latest-investor-insights";
import { storeLatestPitchDeck } from "@/services/latest-pitch-deck";
import { requestIdeaGraph } from "@/api/ideaGraph";
import { PlatformMode } from "@/types/idea";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { AIThinkingAnimation } from "@/components/AIThinkingAnimation";
import { DEMO_MODE } from "@/config/demoMode";
import { applyDemoDataset, generateDemoDataset } from "@/utils/demoDataGenerator";
import { useAppStore } from "@/store/useAppStore";

const starterPrompts = [
  "AI compliance copilot for mid-market fintech teams",
  "Hackathon teammate matching platform based on skills and project intent",
  "Research assistant that maps startup ideas to papers, patents, and market whitespace",
];

export function IdeaForm() {
  const router = useRouter();
  const setAppIdea = useAppStore((state) => state.setIdea);
  const setAppResult = useAppStore((state) => state.setResult);
  const setAppLoading = useAppStore((state) => state.setLoading);
  const [ideaName, setIdeaName] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [mode, setMode] = useState<PlatformMode>("hackathon");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (ideaName.trim().length < 3 || ideaText.trim().length < 12) {
      setError("Add an idea name and a fuller description so the AI engines have enough context.");
      return;
    }

    setLoading(true);
    setAppLoading(true);
    setError(null);
    const startedAt = Date.now();

    try {
      if (DEMO_MODE) {
        const dataset = generateDemoDataset(mode, { name: ideaName.trim(), description: ideaText.trim() });
        applyDemoDataset(dataset);
        setAppIdea(ideaName.trim(), ideaText.trim());
        setAppResult(dataset.analysis);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ai_brain_pending", String(Date.now()));
        }
        const elapsed = Date.now() - startedAt;
        if (elapsed < 800) {
          await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
        }
        router.push("/results");
        return;
      }
      const token = await getDemoAccessToken();
      if (!token) {
        setError("Please sign in to run the full idea analysis flow.");
        return;
      }
      const latestInput = {
        ideaName: ideaName.trim(),
        ideaDescription: ideaText.trim(),
        mode,
      };
      setAppIdea(latestInput.ideaName, latestInput.ideaDescription);
      const response = await analyzeIdea(
        {
          idea_name: latestInput.ideaName,
          idea_text: latestInput.ideaDescription,
          mode,
        },
        token,
      );

      const externalIntelligence = await runIntegratedIdeaAnalysis(latestInput).catch(() => null);
      const investorDecision = await requestInvestorDecision({
        ideaName: latestInput.ideaName,
        ideaDescription: latestInput.ideaDescription,
        ideaAnalysis: externalIntelligence?.ideaAnalysis,
        similarityResults: externalIntelligence
          ? {
              similarityScore: externalIntelligence.similarityScore,
              closestMatches: externalIntelligence.closestMatches,
            }
          : {
              similarityScore: response.similarity_score,
            },
        marketData: {
          market_size_billion_usd: response.market_insights.market_size_billion_usd,
          growth_forecast_cagr: response.market_insights.growth_forecast_cagr,
          best_countries_for_launch: response.market_insights.best_countries_for_launch,
          marketPotential: response.future_impact.market_potential,
          adoptionProbability: response.future_impact.adoption_probability,
          riskLevel: response.future_impact.risk_level,
        },
        competitors:
          response.competitor_intelligence.competitors ??
          externalIntelligence?.githubRepos,
        innovationScore: externalIntelligence?.innovationScore ?? response.innovation_score,
      }).catch(() => null);
      const mergedResponse = externalIntelligence
        ? {
            ...response,
            resource_scan: {
              ...response.resource_scan,
              similar_patents:
                externalIntelligence.patents.length > 0
                  ? externalIntelligence.patents.map((item) => ({
                      title: item.title,
                      source: "USPTO",
                      relevance: Math.max(45, Math.round(100 - externalIntelligence.similarityScore)),
                      applicant: item.applicant,
                      patentNumber: item.patentNumber,
                      filingDate: item.filingDate,
                    }))
                  : response.resource_scan.similar_patents,
              similar_research:
                externalIntelligence.wikipedia.length > 0
                  ? externalIntelligence.wikipedia.map((item) => ({
                      title: item.title,
                      source: "Wikipedia",
                      relevance: Math.max(40, Math.round(100 - externalIntelligence.similarityScore / 1.5)),
                      snippet: item.snippet,
                      url: item.url,
                    }))
                  : response.resource_scan.similar_research,
              similar_startups:
                externalIntelligence.githubRepos.length > 0
                  ? externalIntelligence.githubRepos.map((item) => ({
                      title: item.name,
                      source: "GitHub",
                      relevance: Math.min(99, item.stars > 0 ? Math.round(Math.log10(item.stars + 10) * 24) : 42),
                      description: item.description,
                      url: item.url,
                    }))
                  : response.resource_scan.similar_startups,
              related_technologies:
                externalIntelligence.ideaAnalysis.technologies.length > 0
                  ? externalIntelligence.ideaAnalysis.technologies.map((item, index) => ({
                      name: item,
                      fit: Math.max(65, 92 - index * 7),
                    }))
                  : response.resource_scan.related_technologies,
            },
            external_intelligence: {
              ...externalIntelligence,
              investorDecision: investorDecision ?? undefined,
            },
          }
        : response;

      storeLatestIdeaInput(latestInput);
      setAppResult(mergedResponse);
      if (investorDecision) {
        storeLatestInvestorInsights(investorDecision);
      }
      storeLatestAnalysis(mergedResponse);
      storeLatestInnovationMap(buildInnovationMapData(mergedResponse));
      void requestIdeaGraph(latestInput, token)
        .then((graph) => storeLatestIdeaGraph(graph))
        .catch(() => undefined);
      void requestNoveltyCheck({
        ideaName: latestInput.ideaName,
        ideaDescription: latestInput.ideaDescription,
        ideaAnalysis: externalIntelligence?.ideaAnalysis,
        patents: externalIntelligence?.patents,
        githubRepos: externalIntelligence?.githubRepos,
        wikipediaResults: externalIntelligence?.wikipedia,
        similarityScore: externalIntelligence?.similarityScore ?? response.similarity_score,
      })
        .then((novelty) =>
          storeLatestIdeaNovelty({
            ...novelty,
            sourceFingerprint: `${mergedResponse.idea_name}:${mergedResponse.innovation_score}:${mergedResponse.external_intelligence?.similarityScore ?? mergedResponse.similarity_score}`,
          }),
        )
        .catch(() => undefined);
      void requestGeneratedPitch({
        ideaName: latestInput.ideaName,
        ideaDescription: latestInput.ideaDescription,
        analysis: mergedResponse,
      })
        .then((pitchDeck) =>
          storeLatestPitchDeck({
            ...pitchDeck,
            sourceFingerprint: `${mergedResponse.idea_name}:${mergedResponse.innovation_score}:${mergedResponse.market_insights.market_size_billion_usd}`,
          }),
        )
        .catch(() => undefined);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ai_brain_pending", String(Date.now()));
      }
      const elapsed = Date.now() - startedAt;
      if (elapsed < 800) {
        await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
      }
      router.push("/results");
    } catch (err) {
      if (DEMO_MODE) {
        const dataset = generateDemoDataset(mode);
        applyDemoDataset(dataset);
        setAppIdea(ideaName.trim(), ideaText.trim());
        setAppResult(dataset.analysis);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ai_brain_pending", String(Date.now()));
        }
        const elapsed = Date.now() - startedAt;
        if (elapsed < 800) {
          await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
        }
        router.push("/results");
      } else {
        setError(err instanceof Error ? err.message : "Unable to analyze this idea right now.");
      }
    } finally {
      setLoading(false);
      setAppLoading(false);
    }
  }

  return (
    <>
      <AIThinkingAnimation open={loading} />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <p className="panel-heading">Idea intelligence workspace</p>
        <h2 className="panel-subtitle">Analyze a startup or hackathon concept</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          The platform now combines idea understanding, resource scanning, similarity detection, innovation scoring,
          competitor intelligence, market forecasting, and pitch generation in one pass.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Idea name</span>
            <input
              value={ideaName}
              onChange={(event) => setIdeaName(event.target.value)}
              placeholder="AI Innovation Intelligence Platform"
              className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:bg-white/[0.06]"
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm text-slate-300">Mode</span>
            <div className="flex gap-3">
              {(["hackathon", "business"] as PlatformMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`rounded-full px-4 py-3 text-sm font-medium transition ${
                    mode === option
                      ? "bg-gradient-to-r from-sky-400 to-violet-500 text-slate-950"
                      : "border border-white/10 bg-white/[0.04] text-slate-300"
                  }`}
                >
                  {option === "hackathon" ? "Hackathon Mode" : "Business Mode"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-6 block space-y-2">
          <span className="text-sm text-slate-300">Idea description</span>
          <textarea
            value={ideaText}
            onChange={(event) => setIdeaText(event.target.value)}
            rows={7}
            placeholder="Describe the problem, users, product behavior, and what makes it different."
            className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-sky-400/50 focus:bg-white/[0.06]"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="min-w-[180px]" onClick={handleAnalyze}>
            {loading ? "Running AI Analysis..." : "Run Innovation Analysis"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIdeaText(starterPrompts[Math.floor(Math.random() * starterPrompts.length)])}
          >
            Use Sample Prompt
          </Button>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</div>
        ) : null}
      </Card>

      <Card>
        <p className="panel-heading">Platform engines</p>
        <div className="mt-6 space-y-4">
          {[
            {
              icon: ScanSearch,
              title: "Similarity + Resource Scan",
              copy: "Compares your idea against curated projects, startup-style references, research-style resources, and technology signals.",
            },
            {
              icon: Lightbulb,
              title: "Idea Understanding",
              copy: "Extracts industry, target users, problem statement, risks, and innovation category before scoring.",
            },
            {
              icon: Sparkles,
              title: "Innovation Intelligence",
              copy: "Builds suggestions, competitor views, future impact predictions, and a founder-ready pitch outline.",
            },
            {
              icon: Target,
              title: "Market + Impact Forecasting",
              copy: "Estimates opportunity, best launch countries, long-range adoption, and condition-based simulations.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15">
                <Icon className="h-5 w-5 text-sky-300" />
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
    </>
  );
}
