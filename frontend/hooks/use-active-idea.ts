"use client";

import { useCallback, useEffect, useState } from "react";

import { readCurrentIdeaContext, storeCurrentIdeaContext } from "@/services/current-idea";
import { readAccessToken } from "@/services/auth-session";
import { getFullIdeaAnalysis, getUserIdeas } from "@/services/idea-service";
import { AnalyzeIdeaResponse, IdeaResponse } from "@/types/api";
import { useAppStore } from "@/store/useAppStore";
import { getCachedIdeaWorkspace, useIdeaStore } from "@/store/use-idea-store";

type UseActiveIdeaOptions = {
  preferredIdeaId?: number | null;
};

type ActiveIdeaState = {
  ideas: IdeaResponse[];
  idea: IdeaResponse | null;
  analysis: AnalyzeIdeaResponse | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  authRequired: boolean;
  refresh: () => Promise<void>;
};

export function useActiveIdea(options: UseActiveIdeaOptions = {}): ActiveIdeaState {
  const { preferredIdeaId = null } = options;
  const initialCachedWorkspace =
    typeof window !== "undefined"
      ? getCachedIdeaWorkspace(preferredIdeaId ?? readCurrentIdeaContext()?.ideaId ?? null)
      : null;
  const [ideas, setIdeas] = useState<IdeaResponse[]>(initialCachedWorkspace?.ideas ?? []);
  const [idea, setIdea] = useState<IdeaResponse | null>(initialCachedWorkspace?.idea ?? null);
  const [analysis, setAnalysis] = useState<AnalyzeIdeaResponse | null>(initialCachedWorkspace?.analysis ?? null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialCachedWorkspace ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const refresh = useCallback(async () => {
    const activeToken = readAccessToken();
    setToken(activeToken);

    if (!activeToken) {
      setIdeas([]);
      setIdea(null);
      setAnalysis(null);
      setAuthRequired(true);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAuthRequired(false);
    setError(null);

    try {
      const storedContext = readCurrentIdeaContext();
      const resolvedIdeaId = preferredIdeaId ?? storedContext?.ideaId ?? null;
      const cachedWorkspace = getCachedIdeaWorkspace(resolvedIdeaId);

      if (cachedWorkspace) {
        setIdeas(cachedWorkspace.ideas);
        setIdea(cachedWorkspace.idea);
        setAnalysis(cachedWorkspace.analysis);
        useAppStore.getState().setResult(cachedWorkspace.analysis);
        useAppStore.getState().setIdea(cachedWorkspace.idea.title, cachedWorkspace.idea.description);
        useAppStore.getState().setLoading(false);
        setLoading(false);
        return;
      }

      const userIdeas = await getUserIdeas(activeToken);
      setIdeas(userIdeas);

      const resolvedIdea =
        userIdeas.find((item) => item.id === preferredIdeaId) ??
        userIdeas.find((item) => item.id === storedContext?.ideaId) ??
        userIdeas[0] ??
        null;

      setIdea(resolvedIdea);

      if (!resolvedIdea) {
        setAnalysis(null);
        return;
      }

      storeCurrentIdeaContext({
        ideaId: resolvedIdea.id,
        title: resolvedIdea.title,
        teamId: resolvedIdea.team_id ?? null,
        ideaType: resolvedIdea.mode === "business" ? "business" : "startup",
        location: storedContext?.ideaId === resolvedIdea.id ? storedContext.location : undefined,
      });

      const fullAnalysis = await getFullIdeaAnalysis(resolvedIdea.id, activeToken);
      setAnalysis(fullAnalysis);
      useAppStore.getState().setIdea(resolvedIdea.title, resolvedIdea.description);
      useAppStore.getState().setResult(fullAnalysis);
      useAppStore.getState().setLoading(false);

      useIdeaStore.getState().hydrateWorkspace({
        idea: resolvedIdea,
        analysis: fullAnalysis,
        ideas: userIdeas,
        context: {
          ideaId: resolvedIdea.id,
          title: resolvedIdea.title,
          teamId: resolvedIdea.team_id ?? null,
          ideaType: resolvedIdea.mode === "business" ? "business" : "startup",
          location: storedContext?.ideaId === resolvedIdea.id ? storedContext.location : undefined,
        },
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your saved idea workspace.");
      setIdea(null);
      setAnalysis(null);
      useAppStore.getState().setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [preferredIdeaId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ideas, idea, analysis, token, loading, error, authRequired, refresh };
}
