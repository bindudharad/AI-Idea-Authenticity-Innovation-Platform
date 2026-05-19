"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AnalyzeIdeaResponse, NotificationResponse, TeamSummaryResponse } from "@/types/api";

type AppState = {
  idea: string;
  description: string;
  result: AnalyzeIdeaResponse | null;
  team: TeamSummaryResponse | null;
  notifications: NotificationResponse[];
  loading: boolean;
  setIdea: (idea: string, desc: string) => void;
  setResult: (data: AnalyzeIdeaResponse | null) => void;
  setTeam: (team: TeamSummaryResponse | null) => void;
  setNotifications: (notifications: NotificationResponse[]) => void;
  prependNotification: (notification: NotificationResponse) => void;
  markNotificationRead: (notificationId: string) => void;
  setLoading: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  idea: "",
  description: "",
  result: null,
  team: null,
  notifications: [],
  loading: false,
} satisfies Pick<AppState, "idea" | "description" | "result" | "team" | "notifications" | "loading">;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setIdea: (idea, desc) => set({ idea, description: desc }),
      setResult: (data) => set({ result: data }),
      setTeam: (team) => set({ team }),
      setNotifications: (notifications) => set({ notifications }),
      prependNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications.filter((item) => item.id !== notification.id)].slice(0, 25),
        })),
      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        })),
      setLoading: (value) => set({ loading: value }),
      reset: () => set(initialState),
    }),
    {
      name: "idea-platform-app-cache",
      storage: createJSONStorage(() => window.sessionStorage),
    },
  ),
);
