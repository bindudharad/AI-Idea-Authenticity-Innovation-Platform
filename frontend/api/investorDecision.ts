import { buildApiUrl } from "@/services/api";
import { InvestorDecisionPayload, InvestorDecisionResponse } from "@/types/api";

export async function requestInvestorDecision(payload: InvestorDecisionPayload) {
  const url = buildApiUrl("/investorDecision");
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

  const result = (await response.json()) as InvestorDecisionResponse;
  console.debug("[API] Response:", result);
  return result;
}
