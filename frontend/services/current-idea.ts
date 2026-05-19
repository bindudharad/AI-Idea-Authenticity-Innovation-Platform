"use client";

export type CurrentIdeaContext = {
  ideaId: number;
  title: string;
  teamId?: string | null;
  ideaType?: "startup" | "business";
  location?: {
    country: string;
    state: string;
    city: string;
  };
};

const CURRENT_IDEA_KEY = "idea_platform_current_idea";

export function readCurrentIdeaContext(): CurrentIdeaContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(CURRENT_IDEA_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CurrentIdeaContext;
  } catch {
    window.sessionStorage.removeItem(CURRENT_IDEA_KEY);
    return null;
  }
}

export function storeCurrentIdeaContext(context: CurrentIdeaContext) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(CURRENT_IDEA_KEY, JSON.stringify(context));
}

export function clearCurrentIdeaContext() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(CURRENT_IDEA_KEY);
}
