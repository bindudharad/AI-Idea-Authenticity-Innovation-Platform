"use client";

import { IdeaGraphResponse } from "@/types/api";

const LATEST_IDEA_GRAPH_KEY = "idea_platform_latest_idea_graph";

export function readLatestIdeaGraph(): IdeaGraphResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_IDEA_GRAPH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as IdeaGraphResponse;
  } catch {
    window.localStorage.removeItem(LATEST_IDEA_GRAPH_KEY);
    return null;
  }
}

export function storeLatestIdeaGraph(graph: IdeaGraphResponse) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LATEST_IDEA_GRAPH_KEY, JSON.stringify(graph));
}
