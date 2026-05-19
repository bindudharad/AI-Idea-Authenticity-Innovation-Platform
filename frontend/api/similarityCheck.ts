import { buildApiUrl } from "@/services/api";
import { ExternalSimilarityResult } from "@/types/api";

export async function requestSimilarityCheck(payload: {
  ideaText: string;
  candidates: Array<{ id: string; title: string; text: string; source: string; url?: string }>;
}) {
  const url = buildApiUrl("/similarityCheck");
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

  const result = (await response.json()) as ExternalSimilarityResult;
  console.debug("[API] Response:", result);
  return result;
}
