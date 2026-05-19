import { requestGroqJson } from "@/lib/groqClient";

export async function generateIdeaImprovements(ideaText: string, innovationScore: number, similarityScore: number) {
  const fallback = [
    "Add a stronger proprietary data loop so the product improves as teams use it.",
    "Introduce a sharper workflow wedge that solves a narrow problem better than general tools.",
    "Differentiate the offering with analytics, automation, and a clearer go-to-market focus.",
  ];

  const result = await requestGroqJson<{ suggestions?: string[] }>(
    `Suggest improvements that make this startup idea more innovative and unique.

Idea:
${ideaText}

Current innovation score: ${innovationScore}
Current similarity score: ${similarityScore}

Return strict JSON with key suggestions as an array of 3 short strings.`,
    { suggestions: fallback },
    "Return strict JSON only.",
  );

  return Array.isArray(result.suggestions) && result.suggestions.length > 0
    ? result.suggestions.map((item) => String(item))
    : fallback;
}
