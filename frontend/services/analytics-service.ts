import { apiRequest } from "@/services/api";
import { AnalyticsResponse } from "@/types/analytics";

export function getAnalytics(token: string) {
  return apiRequest<AnalyticsResponse>("/analytics", { token });
}
