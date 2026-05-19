import { apiRequest } from "@/services/api";
import { IdeaGraphPayload, IdeaGraphResponse } from "@/types/api";

export function requestIdeaGraph(payload: IdeaGraphPayload, token: string) {
  return apiRequest<IdeaGraphResponse>("/ideaGraph", {
    method: "POST",
    body: payload,
    token,
  });
}
