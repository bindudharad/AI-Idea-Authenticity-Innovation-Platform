import { extractKeywords } from "@/utils/keywordExtractor";

export async function runKeywordAgent(input: { ideaText: string; priorKeywords?: string[] }) {
  const keywords = extractKeywords(input.ideaText);
  return [...new Set([...(input.priorKeywords ?? []), ...keywords])].slice(0, 10);
}
