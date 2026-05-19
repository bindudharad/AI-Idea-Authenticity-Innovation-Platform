"use client";

import { PlatformMode } from "@/types/idea";

export type LatestIdeaInput = {
  ideaName: string;
  ideaDescription: string;
  mode: PlatformMode;
};

const LATEST_IDEA_INPUT_KEY = "idea_platform_latest_idea_input";

export function readLatestIdeaInput(): LatestIdeaInput | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_IDEA_INPUT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LatestIdeaInput;
  } catch {
    window.localStorage.removeItem(LATEST_IDEA_INPUT_KEY);
    return null;
  }
}

export function storeLatestIdeaInput(input: LatestIdeaInput) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LATEST_IDEA_INPUT_KEY, JSON.stringify(input));
}
