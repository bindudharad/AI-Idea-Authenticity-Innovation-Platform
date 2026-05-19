import { buildApiUrl } from "@/services/api";
import { AuthTokenResponse, RegisterUserPayload, UserProfile } from "@/types/auth";

export function registerUser(payload: RegisterUserPayload) {
  return localJsonRequest<UserProfile>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(username: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  return localFormRequest<AuthTokenResponse>("/api/auth/login", form);
}

export function getCurrentUser(token: string) {
  return localJsonRequest<UserProfile>("/api/user/me", {
    token,
  });
}

type LocalRequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  token?: string;
};

async function localJsonRequest<T>(path: string, options: LocalRequestOptions = {}) {
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

async function localFormRequest<T>(path: string, formData: URLSearchParams) {
  const backendPath = path.startsWith("/api/") ? path.replace(/^\/api/, "") : path;
  const url = buildApiUrl(backendPath);
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
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
