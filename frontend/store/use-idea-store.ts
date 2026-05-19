"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AnalyzeIdeaResponse, IdeaResponse } from "@/types/api";
import type { LatestIdeaInput } from "@/services/latest-idea-input";
import type { CurrentIdeaContext } from "@/services/current-idea";

type IdeaWorkspaceState = {
  input: LatestIdeaInput | null;
  ideas: IdeaResponse[];
  currentIdea: IdeaResponse | null;
  currentContext: CurrentIdeaContext | null;
  analysis: AnalyzeIdeaResponse | null;
  analysisIdeaId: number | null;
  setInput: (input: LatestIdeaInput) => void;
  setIdeaList: (ideas: IdeaResponse[]) => void;
  hydrateWorkspace: (payload: {
    idea: IdeaResponse;
    analysis: AnalyzeIdeaResponse;
    context?: CurrentIdeaContext | null;
    ideas?: IdeaResponse[];
    input?: LatestIdeaInput | null;
  }) => void;
  setCurrentContext: (context: CurrentIdeaContext) => void;
  clearWorkspace: () => void;
};

const initialState = {
  input: null,
  ideas: [],
  currentIdea: null,
  currentContext: null,
  analysis: null,
  analysisIdeaId: null,
} satisfies Pick<IdeaWorkspaceState, "input" | "ideas" | "currentIdea" | "currentContext" | "analysis" | "analysisIdeaId">;

export const useIdeaStore = create<IdeaWorkspaceState>()(
  persist(
    (set) => ({
      ...initialState,
      setInput: (input) => set({ input }),
      setIdeaList: (ideas) => set({ ideas }),
      hydrateWorkspace: ({ idea, analysis, context, ideas, input }) =>
        set((state) => ({
          ideas: ideas ?? mergeIdeaList(state.ideas, idea),
          currentIdea: idea,
          currentContext: context ?? state.currentContext,
          analysis,
          analysisIdeaId: idea.id,
          input: input ?? state.input,
        })),
      setCurrentContext: (context) => set({ currentContext: context }),
      clearWorkspace: () => set(initialState),
    }),
    {
      name: "idea-platform-workspace",
      storage: createJSONStorage(() => window.sessionStorage),
      partialize: (state) => ({
        input: state.input,
        ideas: state.ideas,
        currentIdea: state.currentIdea,
        currentContext: state.currentContext,
        analysis: state.analysis,
        analysisIdeaId: state.analysisIdeaId,
      }),
    },
  ),
);

function mergeIdeaList(existing: IdeaResponse[], currentIdea: IdeaResponse) {
  const next = existing.filter((item) => item.id !== currentIdea.id);
  return [currentIdea, ...next];
}

export function getCachedIdeaWorkspace(ideaId?: number | null) {
  const state = useIdeaStore.getState();
  if (!state.currentIdea || !state.analysis || state.analysisIdeaId == null) {
    return null;
  }

  if (ideaId != null && state.analysisIdeaId !== ideaId) {
    return null;
  }

  return {
    ideas: state.ideas,
    idea: state.currentIdea,
    analysis: state.analysis,
    context: state.currentContext,
    input: state.input,
  };
}
