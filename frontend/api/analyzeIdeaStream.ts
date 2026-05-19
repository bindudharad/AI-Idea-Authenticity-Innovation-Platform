import { buildApiUrl } from "@/services/api";
import { IntegratedIdeaAnalysisPayload, IntegratedIdeaAnalysisResponse } from "@/types/api";

export interface StreamStatus {
  type: "status";
  message: string;
}

export interface StreamResult {
  type: "result";
  data: IntegratedIdeaAnalysisResponse;
}

export interface StreamError {
  type: "error";
  message: string;
}

export type StreamMessage = StreamStatus | StreamResult | StreamError;

export async function runIntegratedIdeaAnalysisStream(
  payload: IntegratedIdeaAnalysisPayload,
  onStatus: (message: string) => void,
  onResult: (data: IntegratedIdeaAnalysisResponse) => void,
  onError: (message: string) => void
) {
  const url = buildApiUrl("/analyzeIdeaStream");
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
    const errorText = await response.text();
    onError(errorText || "Request failed");
    throw new Error(errorText);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onError("No response body");
    throw new Error("No response body");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const message: StreamMessage = JSON.parse(line);
          
          switch (message.type) {
            case "status":
              onStatus(message.message);
              break;
            case "result":
              onResult(message.data);
              break;
            case "error":
              onError(message.message);
              break;
          }
        } catch (parseError) {
          // Skip malformed lines
          console.warn("Failed to parse stream message:", line);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
