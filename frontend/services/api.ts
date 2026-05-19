const API_ROOT_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const API_BASE_URL = `${API_ROOT_URL}/api`;

// Fallback mock data for when API is unavailable
const MOCK_DELAY = 500;

export const mockCommunityIdeas = [
  {
    id: 1,
    idea_name: "AI Climate Insight Engine",
    description: "Real-time climate pattern analysis using neural networks",
    category: "AI",
    innovation_year: 2024,
    impact_score: 88,
    keywords: ["climate", "AI", "neural networks"],
    summary: "Advanced climate analysis system",
    tech_maturity: "Mature",
    industry_tags: ["Environment", "Technology"]
  },
  {
    id: 2,
    idea_name: "BioSignal Coach",
    description: "Wearable biometrics for athletic optimization",
    category: "Healthcare",
    innovation_year: 2024,
    impact_score: 84,
    keywords: ["biometrics", "wearable", "sports"],
    summary: "Biometric performance enhancer",
    tech_maturity: "Growing",
    industry_tags: ["Healthcare", "Sports"]
  },
  {
    id: 3,
    idea_name: "Founder Due Diligence Copilot",
    description: "AI-powered startup evaluation platform",
    category: "AI",
    innovation_year: 2024,
    impact_score: 81,
    keywords: ["startup", "AI", "evaluation"],
    summary: "Startup assessment tool",
    tech_maturity: "Emerging",
    industry_tags: ["Finance", "Technology"]
  }
];

type RequestOptions = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  token?: string;
  headers?: HeadersInit;
};

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getApiRootUrl(): string {
  return API_ROOT_URL;
}

export function buildApiRootUrl(path = "/"): string {
  return `${API_ROOT_URL}${normalizePath(path)}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers } = options;
  const url = `${API_BASE_URL}${normalizePath(path)}`;

  try {
    console.debug("[API] Using URL:", url);
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const payload = (await response.json()) as T;
    console.debug("[API] Response:", payload);
    return payload;
  } catch (error) {
    console.warn(`[API] Call failed for ${url}:`, error);
    
    // Return mock data for community endpoint
    if (path.includes('/community')) {
      console.log('Using fallback mock data for community');
      await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
      return mockCommunityIdeas as T;
    }
    
    // For other endpoints, return empty array/object
    if (path.includes('/similar-ideas')) {
      return [] as T;
    }
    
    throw error;
  }
}

export async function apiFormRequest<T>(path: string, formData: URLSearchParams): Promise<T> {
  const url = `${API_BASE_URL}${normalizePath(path)}`;
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API form request failed: ${response.status}`);
  }

  const payload = (await response.json()) as T;
  console.debug("[API] Response:", payload);
  return payload;
}

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${normalizePath(path)}`;
}
