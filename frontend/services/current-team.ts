"use client";

import type { TeamSummaryResponse } from "@/types/api";

const CURRENT_TEAM_KEY = "idea_platform_current_team";

export function readCurrentTeam(): TeamSummaryResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(CURRENT_TEAM_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TeamSummaryResponse;
  } catch {
    window.sessionStorage.removeItem(CURRENT_TEAM_KEY);
    return null;
  }
}

export function storeCurrentTeam(team: TeamSummaryResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CURRENT_TEAM_KEY, JSON.stringify(team));
}

export function clearCurrentTeam() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CURRENT_TEAM_KEY);
}
