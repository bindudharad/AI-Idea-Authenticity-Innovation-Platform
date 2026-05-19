import { createFallbackEmbedding, normalizeVector } from "@/utils/vectorSimilarity";
import { rememberAsync } from "@/lib/runtimeCache";

const defaultModel = "sentence-transformers/all-MiniLM-L6-v2";

export async function generateEmbedding(text: string): Promise<number[]> {
  return rememberAsync(`embedding:${text}`, async () => {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return createFallbackEmbedding(text);
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${defaultModel}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        return createFallbackEmbedding(text);
      }

      const payload = await response.json();
      const flattened = flattenEmbedding(payload);
      return flattened.length > 0 ? normalizeVector(flattened) : createFallbackEmbedding(text);
    } catch {
      return createFallbackEmbedding(text);
    }
  }, 60 * 60 * 1000);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((text) => generateEmbedding(text)));
}

function flattenEmbedding(payload: unknown): number[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  if (payload.every((item) => typeof item === "number")) {
    return payload as number[];
  }

  const nested = payload as unknown[];
  if (nested.every((item) => Array.isArray(item))) {
    const rows = nested as number[][];
    const width = rows[0]?.length ?? 0;
    if (!width) {
      return [];
    }
    const output = Array.from({ length: width }, () => 0);
    for (const row of rows) {
      for (let index = 0; index < width; index += 1) {
        output[index] += Number(row[index] ?? 0);
      }
    }
    return output.map((value) => value / rows.length);
  }

  return [];
}
