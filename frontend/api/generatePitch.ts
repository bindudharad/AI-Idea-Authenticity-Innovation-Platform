import { buildApiUrl } from "@/services/api";
import { GeneratePitchPayload, GeneratePitchResponse } from "@/types/api";

export async function requestGeneratedPitch(payload: GeneratePitchPayload) {
  const url = buildApiUrl("/generatePitch");
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

  const result = (await response.json()) as GeneratePitchResponse;
  console.debug("[API] Response:", result);
  return result;
}
