"use client";

import { UserProfile } from "@/types/auth";
import { clearCurrentIdeaContext } from "@/services/current-idea";
import { clearCurrentTeam } from "@/services/current-team";
import { useAppStore } from "@/store/useAppStore";
import { useIdeaStore } from "@/store/use-idea-store";

const AUTH_TOKEN_KEY = "idea_platform_auth_token";
const AUTH_USER_KEY = "idea_platform_auth_user";
const AUTH_SESSION_EVENT = "auth-session-changed";

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function emitAuthSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EVENT));
}

export function readAccessToken(): string | null {
  return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
}

export function readAuthUser(): UserProfile | null {
  const storage = getStorage();
  const raw = storage?.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    storage?.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function storeAuthSession(token: string, user: UserProfile) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  emitAuthSessionChange();
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(AUTH_USER_KEY);
  clearCurrentIdeaContext();
  clearCurrentTeam();
  useIdeaStore.getState().clearWorkspace();
  useAppStore.getState().reset();
  emitAuthSessionChange();
}

export function isAuthenticated() {
  return Boolean(readAccessToken());
}

export function subscribeAuthSession(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === AUTH_TOKEN_KEY || event.key === AUTH_USER_KEY) {
      listener();
    }
  };

  const handleSessionChange = () => {
    listener();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_SESSION_EVENT, handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_SESSION_EVENT, handleSessionChange);
  };
}
