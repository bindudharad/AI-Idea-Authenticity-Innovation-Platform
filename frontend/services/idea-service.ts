import { apiRequest, buildApiUrl } from "@/services/api";
import {
  AnalyzeIdeaPayload,
  AnalyzeIdeaResponse,
  AnalysisResultCreatePayload,
  AnalysisResultResponse,
  FullAnalysisPayload,
  FullAnalysisResponse,
  ImpactPredictionResponse,
  IdeaResponse,
  InnovationScoreResponse,
  MarketPredictionResponse,
  PublicIdeaResponse,
  RegisterIdeaPayload,
  ResourceScanResponse,
  SimilarityCheckResponse,
  SuggestionPayload,
  SuggestionResponse,
  NotificationResponse,
  TeamActionResponse,
  TeamMessageResponse,
  TeamSummaryResponse,
  ActivityLogResponse,
  UpdateIdeaPayload
} from "@/types/api";
import { PlatformMode } from "@/types/idea";

type LocalRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

export function analyzeIdea(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<AnalyzeIdeaResponse>("/idea/analyze", {
    method: "POST",
    body: payload,
    token
  });
}

export function analyzeIdeaV2(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<AnalyzeIdeaResponse>("/idea/analyze", {
    method: "POST",
    body: payload,
    token
  });
}

export function analyzeFull(payload: FullAnalysisPayload, token: string) {
  return apiRequest<FullAnalysisResponse>("/analyze-full", {
    method: "POST",
    body: payload,
    token
  });
}

export function similarityCheck(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<SimilarityCheckResponse>("/similarityCheck", {
    method: "POST",
    body: payload,
    token
  });
}

export function innovationScore(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<InnovationScoreResponse>("/innovationScore", {
    method: "POST",
    body: payload,
    token
  });
}

export function resourceScanner(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<ResourceScanResponse>("/resourceScanner", {
    method: "POST",
    body: payload,
    token
  });
}

export function marketPrediction(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<MarketPredictionResponse>("/marketPrediction", {
    method: "POST",
    body: payload,
    token
  });
}

export function impactPrediction(payload: AnalyzeIdeaPayload, token: string) {
  return apiRequest<ImpactPredictionResponse>("/impactPrediction", {
    method: "POST",
    body: payload,
    token
  });
}

export function generateSuggestions(payload: SuggestionPayload, token: string) {
  return apiRequest<SuggestionResponse>("/generate-suggestions", {
    method: "POST",
    body: payload,
    token
  });
}

export function registerIdea(payload: RegisterIdeaPayload, token: string) {
  return localApiRequest<IdeaResponse>("/register-idea", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getUserIdeas(token: string) {
  return localApiRequest<IdeaResponse[]>("/api/ideas", {
    token,
  });
}

export function getIdea(ideaId: number, token: string) {
  return localApiRequest<IdeaResponse>(`/api/ideas/${ideaId}`, {
    token,
  });
}

export function getFullIdeaAnalysis(ideaId: number, token: string) {
  return localApiRequest<AnalyzeIdeaResponse>(`/api/ideas/${ideaId}/full-analysis`, {
    token,
  });
}

export function updateIdea(ideaId: number, payload: UpdateIdeaPayload, token: string) {
  return localApiRequest<IdeaResponse>(`/api/ideas/${ideaId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function getSimilarIdeas(query: string, mode: PlatformMode, token: string) {
  const params = new URLSearchParams({ query, mode });
  return apiRequest<PublicIdeaResponse[]>(`/similar-ideas?${params.toString()}`, {
    token
  });
}

export function getCommunityIdeas(token: string, sortBy = "innovation") {
  const params = new URLSearchParams({ sort_by: sortBy });
  return apiRequest<PublicIdeaResponse[]>(`/community?${params.toString()}`, {
    token
  });
}

export function createTeam(name: string, token: string) {
  return localApiRequest<TeamActionResponse>("/api/team/create", {
    method: "POST",
    body: { name },
    token,
  });
}

export function joinTeam(code: string, token: string) {
  return localApiRequest<TeamActionResponse>("/api/team/join", {
    method: "POST",
    body: { code },
    token,
  });
}

export function getMyTeams(token: string) {
  return localApiRequest<TeamSummaryResponse[]>("/api/team/me", {
    token,
  });
}

export function getTeamIdeas(teamId: string, token: string) {
  return localApiRequest<IdeaResponse[]>(`/api/team/${teamId}/ideas`, {
    token,
  });
}

export function shareIdeaWithTeam(teamId: string, ideaId: number, token: string) {
  return localApiRequest<IdeaResponse>(`/api/team/${teamId}/ideas`, {
    method: "POST",
    body: { ideaId },
    token,
  });
}

export function removeTeamMember(teamId: string, memberId: string, token: string) {
  return localApiRequest<{ success: boolean }>(`/api/team/${teamId}/members/${memberId}`, {
    method: "DELETE",
    token,
  });
}

export function getTeamMessages(teamId: string, token: string) {
  return localApiRequest<TeamMessageResponse[]>(`/api/team/${teamId}/messages`, {
    token,
  });
}

export function sendTeamMessage(teamId: string, content: string, token: string) {
  return localApiRequest<TeamMessageResponse>(`/api/team/${teamId}/messages`, {
    method: "POST",
    body: { content },
    token,
  });
}

export function getTeamActivity(teamId: string, token: string) {
  return localApiRequest<ActivityLogResponse[]>(`/api/team/${teamId}/activity`, {
    token,
  });
}

export function getNotifications(token: string) {
  return localApiRequest<NotificationResponse[]>("/api/notifications", {
    token,
  });
}

export function markNotificationRead(notificationId: string, token: string) {
  return localApiRequest<NotificationResponse>(`/api/notifications/${notificationId}`, {
    method: "PUT",
    body: { read: true },
    token,
  });
}

export function createAnalysisResult(payload: AnalysisResultCreatePayload, token: string) {
  return localApiRequest<AnalysisResultResponse>("/api/analysis-results", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getAnalysisResults(ideaId: number, token: string) {
  return localApiRequest<AnalysisResultResponse[]>(`/api/analysis-results/${ideaId}`, {
    token,
  });
}

export function getLatestAnalysisResult(ideaId: number, token: string) {
  return localApiRequest<AnalysisResultResponse | null>(`/api/ideas/${ideaId}/latest-analysis`, {
    token,
  });
}

export function getCertificateDownloadUrl(ideaId: number) {
  return buildApiUrl(`/ideas/${ideaId}/certificate`);
}

export async function downloadIdeaCertificate(ideaId: number, token: string) {
  const response = await fetch(buildApiUrl(`/ideas/${ideaId}/certificate`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Certificate download failed: ${response.status}`);
  }

  return response.blob();
}

async function localApiRequest<T>(path: string, options: LocalRequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const backendPath = path.startsWith("/api/") ? path.replace(/^\/api/, "") : path;
  const url = buildApiUrl(backendPath);
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    throw new Error(payload?.error ?? `Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as T;
  console.debug("[API] Response:", payload);
  return payload;
}

async function safeReadJson(response: Response): Promise<{ error?: string } | null> {
  try {
    return (await response.json()) as { error?: string };
  } catch {
    return null;
  }
}
