import { buildApiUrl } from "@/services/api";

export async function requestEmbeddings(texts: string[]) {
  const url = buildApiUrl("/generateEmbeddings");
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
  console.debug("[API] Using URL:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ texts }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { embeddings: number[][] };
  console.debug("[API] Response:", payload);
  return payload.embeddings;
}
