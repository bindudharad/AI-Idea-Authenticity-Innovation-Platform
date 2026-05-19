import { buildApiUrl } from "@/services/api";
import { ExternalInnovationScoreResult } from "@/types/api";

export async function requestInnovationScore(payload: {
  similarityScore: number;
  technologies: string[];
  competitionCount: number;
}) {
  const url = buildApiUrl("/innovationScore");
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
    throw new Error(await response.text());
  }

  const result = (await response.json()) as ExternalInnovationScoreResult;
  console.debug("[API] Response:", result);
  return result;
}
