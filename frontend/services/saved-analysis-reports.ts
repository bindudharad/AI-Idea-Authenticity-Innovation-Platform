"use client";

import { SavedAnalysisReport } from "@/types/api";

const SAVED_REPORTS_KEY = "idea_platform_saved_reports";

export function readSavedAnalysisReports(): SavedAnalysisReport[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(SAVED_REPORTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SavedAnalysisReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(SAVED_REPORTS_KEY);
    return [];
  }
}

export function storeSavedAnalysisReport(report: SavedAnalysisReport) {
  if (typeof window === "undefined") {
    return;
  }

  const reports = [report, ...readSavedAnalysisReports()].slice(0, 30);
  window.localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(reports));
}
