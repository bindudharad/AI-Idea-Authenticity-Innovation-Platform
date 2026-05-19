import { requestGroqJson } from "@/lib/groqClient";
import { extractTechnologies } from "@/utils/keywordExtractor";

export async function runIdeaImproverAgent(input: { ideaText: string }) {
  const fallback = {
    suggestions: [
      "Add a sharper vertical niche and a proprietary workflow data loop.",
      "Pair the core experience with predictive recommendations and measurable ROI outputs.",
      "Differentiate with team collaboration, traceability, and launch-ready analytics.",
    ],
  };

  const response = await requestGroqJson<{ suggestions?: string[] }>(
    `Suggest improvements that make the idea more innovative and unique.\n\nIdea:\n${input.ideaText}`,
    fallback,
    "Return strict JSON with one key named suggestions containing an array of short recommendation strings.",
  );

  const suggestions = Array.isArray(response.suggestions)
    ? response.suggestions.map((item) => String(item)).filter(Boolean)
    : fallback.suggestions;

  if (suggestions.length > 0) {
    return suggestions;
  }

  return [
    `Use ${extractTechnologies(input.ideaText)[0]} to create a defensible product moat.`,
    ...fallback.suggestions.slice(1),
  ];
}
