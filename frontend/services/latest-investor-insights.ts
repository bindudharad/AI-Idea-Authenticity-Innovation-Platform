"use client";

import { InvestorDecisionResponse } from "@/types/api";

const LATEST_INVESTOR_INSIGHTS_KEY = "idea_platform_latest_investor_insights";

export function readLatestInvestorInsights(): InvestorDecisionResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LATEST_INVESTOR_INSIGHTS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as InvestorDecisionResponse;
  } catch {
    window.localStorage.removeItem(LATEST_INVESTOR_INSIGHTS_KEY);
    return null;
  }
}

export function storeLatestInvestorInsights(value: InvestorDecisionResponse) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LATEST_INVESTOR_INSIGHTS_KEY, JSON.stringify(value));
}
