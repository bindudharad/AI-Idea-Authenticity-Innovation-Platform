"use client";

import { useEffect, useState } from "react";

import { readLatestAnalysis } from "@/services/latest-analysis";
import { AnalyzeIdeaResponse } from "@/types/api";

export function useLatestAnalysis() {
  const [analysis, setAnalysis] = useState<AnalyzeIdeaResponse | null>(null);

  useEffect(() => {
    setAnalysis(readLatestAnalysis());
  }, []);

  return analysis;
}
