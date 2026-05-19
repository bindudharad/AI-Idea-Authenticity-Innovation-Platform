"use client";

import { InnovationMapResponse } from "@/types/api";

const LATEST_INNOVATION_MAP_KEY = "idea_platform_latest_innovation_map";

export function readLatestInnovationMap(): InnovationMapResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_INNOVATION_MAP_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as InnovationMapResponse;
  } catch {
    window.localStorage.removeItem(LATEST_INNOVATION_MAP_KEY);
    return null;
  }
}

export function storeLatestInnovationMap(value: InnovationMapResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LATEST_INNOVATION_MAP_KEY, JSON.stringify(value));
}
