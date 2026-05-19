"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ScanSearch, Sparkles, Target } from "lucide-react";

import { AIThinkingAnimation } from "@/components/AIThinkingAnimation";
import { createAnalysisResult, getFullIdeaAnalysis, registerIdea } from "@/services/idea-service";
import { readCurrentTeam } from "@/services/current-team";
import { getDemoAccessToken } from "@/services/demo-session";
import { storeCurrentIdeaContext } from "@/services/current-idea";
import { storeLatestIdeaInput } from "@/services/latest-idea-input";
import { LOCATION_DATA, getDefaultLocation } from "@/lib/location-profit-intelligence";
import { IdeaType } from "@/types/idea";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { useIdeaStore } from "@/store/use-idea-store";

const starterPrompts = [
  "AI compliance copilot for mid-market fintech teams",
  "Premium cloud kitchen for healthy office lunches in Bengaluru",
  "Research assistant that maps startup ideas to papers, patents, and market whitespace",
];

export function IdeaFormStream() {
  const router = useRouter();
  const hydrateWorkspace = useIdeaStore((state) => state.hydrateWorkspace);
  const setInput = useIdeaStore((state) => state.setInput);
  const setAppIdea = useAppStore((state) => state.setIdea);
  const setAppResult = useAppStore((state) => state.setResult);
  const setAppLoading = useAppStore((state) => state.setLoading);
  const defaultLocation = getDefaultLocation();
  const [ideaName, setIdeaName] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [ideaType, setIdeaType] = useState<IdeaType>("startup");
  const [country, setCountry] = useState(defaultLocation.country);
  const [state, setState] = useState(defaultLocation.state);
  const [city, setCity] = useState(defaultLocation.city);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "business") {
      return;
    }

    setIdeaType("business");
    setIdeaName("Healthy Office Lunch Cloud Kitchen");
    setIdeaText(
      "A premium cloud kitchen in Bengaluru that delivers healthy, affordable office lunches to technology workers. It focuses on recurring subscriptions, mid-range pricing, fast delivery, and locations near dense commercial hubs with manageable competition.",
    );
    setCountry("India");
    setState("Karnataka");
    setCity("Bengaluru");
  }, []);

  async function handleAnalyze() {
    if (ideaName.trim().length < 3 || ideaText.trim().length < 12) {
      setError("Add an idea name and a fuller description so the backend engines have enough context.");
      return;
    }

    setLoading(true);
    setAppLoading(true);
    setError(null);
    setCurrentStatus("Saving idea workspace...");

    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setError("Please sign in to create and save a startup workspace.");
        return;
      }
      const savedIdea = await registerIdea(
        {
          idea_name: ideaName.trim(),
          description: ideaText.trim(),
          mode: ideaType,
          idea_type: ideaType,
          is_public: false,
          team_id: readCurrentTeam()?.id ?? null,
        },
        token,
      );

      setCurrentStatus("Generating canonical backend report...");
      const analysis = savedIdea.result ?? (await getFullIdeaAnalysis(savedIdea.id, token));

      await createAnalysisResult(
        {
          idea_id: savedIdea.id,
          innovation_score: analysis.innovation_score,
          similarity_score: analysis.similarity_score,
          technology_readiness:
            Number(analysis.radar_metrics.feasibility ?? analysis.radar_metrics.technology_readiness ?? 0),
          market_potential: Number(
            analysis.radar_metrics.market_potential ?? analysis.market_insights.growth_forecast_cagr ?? 0,
          ),
          ai_summary: analysis.copy_claim_warning,
          problem_statement: analysis.idea_profile.problem_statement,
          proposed_solution: analysis.pitch.solution,
          innovation_highlights: analysis.suggestions.slice(0, 4),
        },
        token,
      );

      const latestInput = {
        ideaName: ideaName.trim(),
        ideaDescription: ideaText.trim(),
        mode: ideaType,
      } as const;

      storeLatestIdeaInput(latestInput);
      storeCurrentIdeaContext({
        ideaId: savedIdea.id,
        title: savedIdea.title,
        teamId: savedIdea.team_id ?? null,
        ideaType,
        location: { country, state, city },
      });
      setInput(latestInput);
      setAppIdea(latestInput.ideaName, latestInput.ideaDescription);
      setAppResult(analysis);
      hydrateWorkspace({
        idea: savedIdea,
        analysis,
        context: {
          ideaId: savedIdea.id,
          title: savedIdea.title,
          teamId: savedIdea.team_id ?? null,
          ideaType,
          location: { country, state, city },
        },
        ideas: [savedIdea],
        input: latestInput,
      });

      setCurrentStatus("Analysis complete. Opening dashboard...");
      router.push(`/dashboard?ideaId=${savedIdea.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to analyze this idea right now.");
    } finally {
      setLoading(false);
      setAppLoading(false);
      setCurrentStatus("");
    }
  }

  return (
    <>
      <AIThinkingAnimation open={loading} currentStatus={currentStatus} />
      <div className="grid gap-8 xl:grid-cols-[2fr_1fr] xl:gap-[30px]">
        <Card className="panel-hover h-full">
          <p className="panel-heading">Universal intelligence workspace</p>
          <h2 className="panel-subtitle">Guided AI business analysis</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Follow four steps: choose type, enter the idea, select location, and run AI analysis.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              ["1", "Choose type"],
              ["2", "Enter idea"],
              ["3", "Select location"],
              ["4", "Run AI analysis"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-black text-cyan-300">
                  {step}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-sm font-semibold text-white">What type of idea are you analyzing?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                {
                  value: "startup",
                  label: "Startup Idea",
                  copy: "Innovation, similarity, trends, feasibility, and funding readiness.",
                },
                {
                  value: "business",
                  label: "Business Idea",
                  copy: "Location, demand, competition, profit, cost, and break-even intelligence.",
                },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIdeaType(option.value)}
                  className={`rounded-3xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                    ideaType === option.value
                      ? "border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_26px_rgba(34,211,238,0.16)]"
                      : "border-white/10 bg-white/[0.035] hover:bg-white/[0.055]"
                  }`}
                >
                  <span className="text-base font-bold text-white">{option.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-400">{option.copy}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="mt-8 block space-y-2">
            <span className="text-sm text-slate-300">Idea name</span>
            <input
              value={ideaName}
              onChange={(event) => setIdeaName(event.target.value)}
              placeholder={ideaType === "business" ? "Healthy Office Lunch Cloud Kitchen" : "AI Innovation Intelligence Platform"}
              className="w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-[18px] py-[14px] text-sm text-white outline-none transition focus:border-sky-400/50 focus:bg-white/[0.06]"
            />
          </label>

          <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-3">
            <LocationSelect
              label="Country"
              value={country}
              options={LOCATION_DATA.map((item) => item.name)}
              onChange={(nextCountry) => {
                const selectedCountry = LOCATION_DATA.find((item) => item.name === nextCountry) ?? LOCATION_DATA[0];
                const selectedState = selectedCountry.states[0];
                setCountry(selectedCountry.name);
                setState(selectedState.name);
                setCity(selectedState.cities[0].name);
              }}
            />
            <LocationSelect
              label="State"
              value={state}
              options={(LOCATION_DATA.find((item) => item.name === country) ?? LOCATION_DATA[0]).states.map((item) => item.name)}
              onChange={(nextState) => {
                const selectedCountry = LOCATION_DATA.find((item) => item.name === country) ?? LOCATION_DATA[0];
                const selectedState = selectedCountry.states.find((item) => item.name === nextState) ?? selectedCountry.states[0];
                setState(selectedState.name);
                setCity(selectedState.cities[0].name);
              }}
            />
            <LocationSelect
              label="City"
              value={city}
              options={
                ((LOCATION_DATA.find((item) => item.name === country) ?? LOCATION_DATA[0]).states.find((item) => item.name === state) ??
                  LOCATION_DATA[0].states[0]).cities.map((item) => item.name)
              }
              onChange={setCity}
            />
          </div>

          <label className="mt-6 block space-y-2 mb-6">
            <span className="text-sm text-slate-300">Idea description</span>
            <textarea
              value={ideaText}
              onChange={(event) => setIdeaText(event.target.value)}
              rows={7}
              placeholder={
                ideaType === "business"
                  ? "Describe the business, city/customer context, pricing, competition, costs, and what makes it different."
                  : "Describe the problem, users, product behavior, and what makes it different."
              }
              className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-[18px] py-[14px] text-sm leading-7 text-white outline-none transition focus:border-sky-400/50 focus:bg-white/[0.06]"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="min-w-[180px]" onClick={handleAnalyze}>
              {loading ? "Running Backend Analysis..." : ideaType === "business" ? "Run Business Analysis" : "Run Startup Analysis"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIdeaText(starterPrompts[Math.floor(Math.random() * starterPrompts.length)])}
            >
              Use Sample Prompt
            </Button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
              {error}
            </div>
          ) : null}
        </Card>

        <Card className="panel-hover h-full">
          <p className="panel-heading">Platform engines</p>
          <div className="mt-6 space-y-4">
            {[
              {
                icon: ScanSearch,
                title: "Adaptive Analysis",
                copy: "Startup ideas focus on innovation and funding. Business ideas focus on location, demand, competition, and profit.",
              },
              {
                icon: Lightbulb,
                title: "Idea Understanding",
                copy: "Extracts industry, target users, problem statement, risks, and innovation category before scoring.",
              },
              {
                icon: Sparkles,
                title: "Innovation Intelligence",
                copy: "Builds suggestions, competitor views, impact projections, and founder-ready pitch inputs from the backend.",
              },
              {
                icon: Target,
                title: "Modular Workspace",
                copy: "Creates a saved idea workspace so dashboard, simulator, mentor, investor, and team pages all stay in sync.",
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

function LocationSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
