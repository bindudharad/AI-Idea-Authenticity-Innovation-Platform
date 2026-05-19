"use client";

import { NoveltyCheckResponse } from "@/types/api";

const LATEST_IDEA_NOVELTY_KEY = "idea_platform_latest_idea_novelty";

export function readLatestIdeaNovelty(): NoveltyCheckResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_IDEA_NOVELTY_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as NoveltyCheckResponse;
  } catch {
    window.localStorage.removeItem(LATEST_IDEA_NOVELTY_KEY);
    return null;
  }
}

export function storeLatestIdeaNovelty(value: NoveltyCheckResponse) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LATEST_IDEA_NOVELTY_KEY, JSON.stringify(value));
}
