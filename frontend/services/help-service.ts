import { apiRequest } from "@/services/api";
import { HelpChatPayload, HelpChatResponse } from "@/types/api";

export function helpChat(payload: HelpChatPayload) {
  return apiRequest<HelpChatResponse>("/help-chat", {
    method: "POST",
    body: payload,
  });
}
