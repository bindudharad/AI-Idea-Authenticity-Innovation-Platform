"use client";

import { readAccessToken } from "@/services/auth-session";

export async function getDemoAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const token = readAccessToken();
  return token ?? null;
}
