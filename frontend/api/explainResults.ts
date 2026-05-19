import { buildApiUrl } from "@/services/api";
import { ExplainableAiResponse } from "@/types/api";

export async function requestExplainableAi(payload: {
  ideaName: string;
  innovationScore: number;
  similarityScore: number;
  competitionLevel?: string;
  technologyNovelty?: number;
  marketPotential?: string;
}): Promise<ExplainableAiResponse> {
  const url = buildApiUrl("/explainResults");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to generate explainable AI summary.");
  }

  const result = (await response.json()) as ExplainableAiResponse;
  console.debug("[API] Response:", result);
  return result;
}
