import { buildApiUrl } from "@/services/api";
import { WikipediaSearchResult } from "@/types/api";

export async function requestWikipediaSearch(keyword: string) {
  const url = buildApiUrl("/searchWikipedia");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ keyword }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { results: WikipediaSearchResult[] };
  console.debug("[API] Response:", payload);
  return payload.results;
}
