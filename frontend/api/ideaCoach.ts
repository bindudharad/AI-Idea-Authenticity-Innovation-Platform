import { buildApiUrl } from "@/services/api";
import { IdeaCoachResponse } from "@/types/api";

export async function requestIdeaCoach(payload: {
  ideaName: string;
  ideaDescription: string;
  innovationScore: number;
  competitionLevel?: string;
}): Promise<IdeaCoachResponse> {
  const url = buildApiUrl("/ideaCoach");
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
    throw new Error("Unable to generate idea coaching suggestions.");
  }

  const result = (await response.json()) as IdeaCoachResponse;
  console.debug("[API] Response:", result);
  return result;
}
