"use client";

import { GeneratePitchResponse } from "@/types/api";

export const LATEST_PITCH_DECK_KEY = "idea_platform_latest_pitch_deck";

export function readLatestPitchDeck(): GeneratePitchResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_PITCH_DECK_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GeneratePitchResponse;
  } catch {
    window.localStorage.removeItem(LATEST_PITCH_DECK_KEY);
    return null;
  }
}

export function storeLatestPitchDeck(pitchDeck: GeneratePitchResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LATEST_PITCH_DECK_KEY, JSON.stringify(pitchDeck));
}
