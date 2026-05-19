import { buildApiUrl } from "@/services/api";
import { IntegratedIdeaAnalysisPayload, IntegratedIdeaAnalysisResponse } from "@/types/api";

export async function runIntegratedIdeaAnalysis(payload: IntegratedIdeaAnalysisPayload) {
  const url = buildApiUrl("/analyze");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      idea: payload.ideaName,
      description: payload.ideaDescription,
      idea_type: payload.idea_type,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const result = (await response.json()) as IntegratedIdeaAnalysisResponse;
  console.debug("[API] Response:", result);
  return result;
}
